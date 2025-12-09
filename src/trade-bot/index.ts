// src/trade-bot/index.ts
import WebSocket from "ws";
import { prisma } from "../../lib/prisma";
import { adminAuth } from "../../lib/firebaseAdmin";

const DERIV_WS = "wss://ws.binaryws.com/websockets/v3?app_id=1089";

// Utility: open a deriv ws for a token and subscribe to transactions
function createWsForToken(token: string) {
  const ws = new WebSocket(DERIV_WS);
  ws.on("open", () => {
    ws.send(JSON.stringify({ authorize: token }));
    // subscribe to transactions
    ws.send(JSON.stringify({ transaction: 1, subscribe: 1 }));
  });
  return ws;
}

async function run() {
  console.log("Trade-bot starting...");
  // fetch active master tokens
  const masters = await prisma.masterToken.findMany({ 
    where: { isActive: true } 
  });

  for (const m of masters) {
    const ws = createWsForToken(m.token);

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (!data.transaction) return;
        const tx = data.transaction;
        // basic filter: only trade buy/sell events with transaction_id
        console.log("Master tx for", m.accountId, tx);

        // find all active copiers for this master
        const copiers = await prisma.copierToken.findMany({ where: { masterId: m.id, isActive: true } });

        for (const copier of copiers) {
          // prepare buy parameters - you'll typically map symbol, amount, duration, etc.
          // This is a basic example using same amount scaled by riskMultiplier and stake type.
          const amount = tx.amount ?? 1;
          // stake logic:
          const stakeAmount = copier.stakeType === "FIXED"
            ? (copier.stakeAmount ?? 10)
            : (amount * (copier.stakeAmount ?? 100) / 100) * copier.riskMultiplier;

          // Open a new WS to place buy for copier
          const cws = new WebSocket(DERIV_WS);
          cws.on("open", () => {
            cws.send(JSON.stringify({ authorize: copier.CopierToken }));
          });

          cws.on("message", async (cm) => {
            const cdata = JSON.parse(cm.toString());
            if (cdata.authorize) {
              // build buy request using master's contract_type/symbol/duration; real mapping depends on tx payload
              const buyPayload = {
                buy: 1,
                price: stakeAmount,
                parameters: {
                  amount: stakeAmount,
                  basis: "stake",
                  contract_type: tx.contract_type,
                  currency: tx.currency || "USD",
                  symbol: tx.symbol,
                  duration: tx.duration,
                  duration_unit: tx.duration_unit,
                },
              };
              cws.send(JSON.stringify(buyPayload));
            }

            if (cdata.buy) {
              // success
              await prisma.copiedTrade.create({
                data: {
                  masterId: m.id,
                  copierId: copier.id,
                  masterTxId: tx.transaction_id || String(tx.id || ""),
                  copierContractId: String(cdata.buy.contract_id),
                  status: "SUCCESS",
                },
              });
              cws.close();
            }

            if (cdata.error) {
              await prisma.copiedTrade.create({
                data: {
                  masterId: m.id,
                  copierId: copier.id,
                  masterTxId: tx.transaction_id || String(tx.id || ""),
                  status: "FAILED",
                  errorMessage: JSON.stringify(cdata.error),
                },
              });
              cws.close();
            }
          });

          cws.on("error", async (err) => {
            console.error("Copier ws error", err);
            await prisma.copiedTrade.create({
              data: {
                masterId: m.id,
                copierId: copier.id,
                masterTxId: tx.transaction_id || String(tx.id || ""),
                status: "FAILED",
                errorMessage: String(err),
              },
            });
          });
        }
      } catch (e) {
        console.error("Trade handler error", e);
      }
    });

    ws.on("error", (err) => {
      console.error("Master ws error", m.id, err);
    });
  }
}

run().catch((e) => console.error(e));
