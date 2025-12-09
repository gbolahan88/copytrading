import { NextResponse } from "next/server";
import WebSocket from "ws";
import { adminAuth } from "../../../../../lib/firebaseAdmin";
import { prisma } from "../../../../../lib/prisma";

type DerivAccount = { 
  accountId: string; 
  currency: string; 
  balance: number; 
  email: string;
  profit: number;
  equity: number;
  loss: number;
};

const DERIV_WS = "wss://ws.binaryws.com/websockets/v3?app_id=1089";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Prefer finding by Firebase UID, fallback to email
    const tokens = await prisma.masterToken.findMany({
      where: { userId: decoded.uid },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        token: true,
        accountType: true,
        balance: true,
        currency: true,
        accountId: true,
        email: true, 
        profit: true,
        equity: true,
        loss: true,  
        validatedAt: true,
        isActive: true,
        
      }
    });

    return NextResponse.json(tokens, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/tokens/master", err);
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
    const { token, label = "My Master", accountType = "REAL" } = body;
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    // ensure user record exists (creates with id = firebase uid)
    let user = await prisma.user.findUnique({ where: { id: decoded.uid } });
    if (!user) {
      user = await prisma.user.create({ 
        data: { 
          id: decoded.uid, 
          email: decoded.email || null 
        }
      });
    }

    // validate via websocket
    const accountData: DerivAccount = await new Promise((resolve, reject) => {
      const ws = new WebSocket(DERIV_WS);
      const timer = setTimeout(() => { ws.close(); reject(new Error("DERIV WS timeout")); }, 10000);

      // After ws.on("open") -> send authorize
      ws.on("open", () => {
        ws.send(JSON.stringify({ authorize: token }));
      });

      // Handle messages
      ws.on("message", (m) => {
        const data = JSON.parse(m.toString());

        // Handle errors
        if (data.error) {
          clearTimeout(timer);
          ws.close();
          reject(new Error(data.error.message || "Deriv error"));
          return;
        }

        // Authorization successful
        if (data.authorize) {
          const authData = data.authorize;
          const accFromList = Array.isArray(authData.account_list) && authData.account_list[0];

          const balance = Number(authData.balance ?? accFromList?.balance ?? 0);
          const equity = Number(authData.equity ?? accFromList?.equity ?? balance);
          const profit = Number(authData.profit ?? accFromList?.profit ?? 0);
          const loss = profit < 0 ? Math.abs(profit) : 0;

          const accountId = authData.loginid || accFromList?.loginid || "";
          const currency = authData.currency || accFromList?.currency || "";
          const email = authData.email || accFromList?.email || "";

          resolve({ accountId, currency, balance, email, profit, equity, loss });
        }
      });

      ws.on("error", (err) => {
        clearTimeout(timer);
        ws.close();
        reject(new Error("WS error"));
      });
    });

    //save in database
    const saved = await prisma.masterToken.create({
      data: {
        userId: decoded.uid,
        label,
        token,
        accountType: accountType === "DEMO" ? "DEMO" : "REAL",
        isActive: true,
        validatedAt: new Date(),
        accountId: accountData.accountId,
        balance: accountData.balance,
        currency: accountData.currency,
        email: accountData.email,
        profit: accountData.profit,  
        loss: accountData.loss,
        equity: accountData.equity, 
      },
    });

    return NextResponse.json(saved, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/tokens/master", err);
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
    const { id, label, token, accountType, isActive } = body;
    if (!id) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    // update only if belongs to user
    const updated = await prisma.masterToken.updateMany({
      where: { id, userId: decoded.uid },
      data: { label, token, accountType, isActive },
    });

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (err: unknown) {
    console.error("PATCH /api/tokens/master", err);
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
    if (!id) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    await prisma.masterToken.deleteMany({ where: { id, userId: decoded.uid } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/tokens/master", err);
    return NextResponse.json({ error: (err as Error).message || "Failed" }, { status: 500 });
  }
}





/*import { NextResponse } from "next/server";
import WebSocket from "ws";
import { adminAuth } from "../../../../../lib/firebaseAdmin";
import { prisma } from "../../../../../lib/prisma";

type DerivAccount = {
  accountId: string;
  currency: string;
  balance: number;
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const tokens = await prisma.masterToken.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tokens, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/tokens/master error:", err);
    let message = "Failed to fetch tokens";
    if (typeof err === "string") message = err;
    else if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "No auth token" }, { status: 401 });

    const idToken = authHeader.replace("Bearer ", "");
    const decodedUser = await adminAuth.verifyIdToken(idToken);

    const { token, label = "My Master", accountType = "REAL" } = await req.json();
    console.log("Received token:", { token, label, accountType });

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Check if user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: decodedUser.uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: decodedUser.uid,
          email: decodedUser.email || "",
        },
      });
    }

    // Validate the token with Deriv WebSocket API
    const accountData: DerivAccount = await new Promise((resolve, reject) => {
      const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");

      const timer = setTimeout(() => {
        ws.close();
        reject("DERIV WEBSOCKET Connection timeout");
      }, 10000); // 10 seconds timeout

      ws.on("open", () => { 
        console.log("WebSocket connection opened");
        ws.send(JSON.stringify({ authorize: token }));
      });
      
      ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        console.log("WebSocket message received:", data);

        if (data.error) {
          clearTimeout(timer);
          ws.close();
          reject(data.error.message);
        } 
        
        if (data.authorize) {
          clearTimeout(timer);
          ws.close();
          console.log("Token authorized, account data:", data.authorize);
          const authData = data.authorize;

          // pick the main loginId and balance
          const mainAccount = Array.isArray(authData.loginid) 
          ? authData.account_list[0]
          : null;
          
          resolve({
            accountId: data.authorize.loginid || mainAccount?.loginid || "",
            currency: data.authorize.currency || mainAccount?.currency || "",
            balance: data.authorize.balance ?? mainAccount?.balance ?? 0,
          });
        }
      });

      ws.on("error", (err) => {
        clearTimeout(timer);
        ws.close();
        console.error("WebSocket error:", err);
        reject("WebSocket error");
      });
    });

    // Save the token and account data to the database
    const savedToken = await prisma.masterToken.create({
      data: {
        userId: decodedUser.uid,
        label,
        token,
        accountType: accountType.toUpperCase() === "DEMO" ? "DEMO" : "REAL",
        isActive: true,
        validatedAt: new Date(),
        accountId: accountData.accountId,
        currency: accountData.currency,
        balance: accountData.balance,
      },
    })

    return NextResponse.json({...savedToken, accountData }, { status: 200 });
  } catch (err: unknown) {
    let message = "Failed to validate token";
    if (typeof err === "string") message = err;
    else if (err instanceof Error) message = err.message;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const { id, label, token, accountType, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    const updated = await prisma.masterToken.updateMany({
      where: { id, userId },
      data: { label, token, accountType, isActive },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    let message = "Failed to update token";
    if (typeof err === "string") message = err;
    else if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    await prisma.masterToken.deleteMany({
      where: { id, userId },
    });
  return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: unknown) {
      let message = "Failed to delete token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }



 /* const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Authorization token" }, { status: 401 });
    } */