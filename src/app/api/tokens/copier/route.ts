import { NextResponse } from "next/server";
import WebSocket from "ws";
import { adminAuth } from "../../../../../lib/firebaseAdmin";
import { prisma } from "../../../../../lib/prisma";

const DERIV_WS = "wss://ws.binaryws.com/websockets/v3?app_id=1089";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const copiers = await prisma.copierToken.findMany({
      where: { userId: decoded.uid },
      include: { master: true },
    });

    const result = copiers.map((c) => ({
      id: c.id,
      token: c.CopierToken,
      masterId: c.masterId,
      masterLabel: c.master.label,
      riskMultiplier: c.riskMultiplier,
      stakeType: c.stakeType,
      stakeAmount: c.stakeAmount,
      accountId: c.accountId,
      email: c.email,
      accountType: c.accountType,
      isActive: c.isActive,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/tokens/copier", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const body = await req.json();
    const { copierToken, masterId, stakeType = "PERCENTAGE", stakeAmount = 100 } = body;
    if (!copierToken) return NextResponse.json({ error: "Copier token required" }, { status: 400 });

    // Validate copier token via Deriv
    const valid = await new Promise<{ loginid: string; email: string } | false>((resolve) => {
      const ws = new WebSocket(DERIV_WS);
      ws.on("open", () => ws.send(JSON.stringify({ authorize: copierToken })));
      ws.on("message", (m) => {
        const data = JSON.parse(m.toString());
        if (data.error) resolve(false);
        if (data.authorize) resolve({ 
          loginid: data.authorize.loginid || (Array.isArray(data.authorize.account_list) && data.authorize.account_list[0]?.loginid),
          email: data.authorize.email
        });
      });
      ws.on("error", () => resolve(false));
      setTimeout(() => resolve(false), 8000);
    });

    if (!valid) return NextResponse.json({ error: "Invalid copier token" }, { status: 400 });

    const master = await prisma.masterToken.findUnique({ where: { id: masterId } });
    if (!master) return NextResponse.json({ error: "Master not found" }, { status: 404 });

    const copier = await prisma.copierToken.create({
      data: {
        userId: decoded.uid,
        CopierToken: copierToken,
        accountId: valid.loginid,
        email: valid.email,
        masterId: master.id,
        riskMultiplier: 1.0,
        accountType: master.accountType,
        stakeType,
        stakeAmount,
        isActive: true,
        validatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, copier }, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/tokens/copier", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const body = await req.json();
    const { id, isActive, stakeAmount, riskMultiplier } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await prisma.copierToken.updateMany({
      where: { id, userId: decoded.uid },
      data: { isActive, stakeAmount, riskMultiplier },
    });

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (err: unknown) {
    console.error("PATCH /api/tokens/copier", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.copierToken.deleteMany({ where: { id, userId: decoded.uid } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/tokens/copier", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}





/*import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { adminAuth } from "../../../../../lib/firebaseAdmin";
import WebSocket from "ws";


export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const copiers = await prisma.copierToken.findMany({
      where: { userId },
      include: { master: true },
    });

    // Map masterlabel for  frontend
    const result = copiers.map((c) => ({
      id: c.id,
      copierToken: c.CopierToken,
      masterId: c.masterId,
      masterLabel: c.master.label,
      riskMultiplier: c.riskMultiplier,
      stakeType: c.stakeType || "FOLLOW MASTER",
      stakeAmount: c.stakeAmount || 100,
      accountId: c.accountId,
      accountType: c.accountType,
      isActive: c.isActive,
    }))

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch copier tokens" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const body = await req.json();
    const { copierToken, masterId, stakeType, stakeAmount } = body;

    // 1️⃣ Validate copier token via Deriv WebSocket
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

    const valid = await new Promise<{ loginid: string } | false>((resolve) => {
      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            authorize: copierToken,
          })
        );
      });

      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.error) resolve(false);
        if (data.authorize) resolve({ loginid: data.authorize.loginid });
      });
    });

    if (!valid) return NextResponse.json({ error: "Invalid copier token" }, { status: 400 });

    // 2️⃣ Ensure the master exists
    const master = await prisma.masterToken.findUnique({ where: { id: masterId } });
    if (!master) return NextResponse.json({ error: "Master token not found" }, { status: 404 });

    // 3️⃣ Save copier token
    const copier = await prisma.copierToken.create({
      data: {
        userId: decoded.uid,
        CopierToken: copierToken,
        accountId: valid.loginid,
        masterId: master.id,
        riskMultiplier: 1.0, // default multiplier
        accountType: master.accountType,
        stakeType,
        stakeAmount,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, copier });
  } catch (error) {
    console.error("Copier registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}*/
