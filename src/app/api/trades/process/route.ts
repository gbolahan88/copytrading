// app/api/trades/process/route.ts  (or pages/api/trades/process.ts)
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; 
import { adminAuth } from "../../../../../lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { copiedTradeId, followerProfit } = body;

    if (!copiedTradeId) return NextResponse.json({ error: "copiedTradeId required" }, { status: 400 });
    if (typeof followerProfit !== "number") return NextResponse.json({ error: "followerProfit (number) required" }, { status: 400 });

    // Load copiedTrade with relations
    const existing = await prisma.copiedTrade.findUnique({
      where: { id: copiedTradeId },
      include: { master: true, copier: true },
    });
    if (!existing) return NextResponse.json({ error: "CopiedTrade not found" }, { status: 404 });

    if (existing.processed) {
      return NextResponse.json({ success: true, message: "Already processed", processed: true }, { status: 200 });
    }

    // Only pay fees when followerProfit is positive (profit). If you want to charge on both wins and losses, change logic.
    const feePercentage = existing.master?.performanceFee ?? 0;

    // Compute fee: if followerProfit <= 0, fee = 0
    const fee = followerProfit > 0 ? (followerProfit * feePercentage) / 100 : 0;

    // Transaction: update copiedTrade, create MasterEarning, update master earnings and master.profit
    const tx = await prisma.$transaction(async (prismaTr) => {
      // 1) Update copiedTrade
      const updatedTrade = await prismaTr.copiedTrade.update({
        where: { id: copiedTradeId },
        data: {
          followerProfit,
          masterFee: fee,
          processed: true,
          // optionally update status: "SUCCESS"
        },
      });

      // 2) Create MasterEarning entry (only when fee > 0)
      let masterEarning = null;
      if (fee > 0) {
        masterEarning = await prismaTr.masterEarning.create({
          data: {
            masterId: existing.masterId,
            copierId: existing.copierId,
            tradeId: updatedTrade.id,
            amount: fee,
            followerProfit,
            percentage: feePercentage,
          },
        });

        // 3) Update master totals (earnings + profit)
        await prismaTr.masterToken.update({
          where: { id: existing.masterId },
          data: {
            earnings: { increment: fee },
            // Optionally update other summary fields for reporting:
            profit: { increment: fee }, // keep as total profit for master account (if you want)
          },
        });
      } else {
        // If fee is 0, still update master.profit maybe with followerProfit? Decide policy. Here we don't credit master but we can add a record if desired.
      }

      return { updatedTrade, masterEarning };
    });

    return NextResponse.json({ success: true, result: tx }, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/trades/process", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}
