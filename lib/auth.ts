// lib/auth.ts
import { adminAuth } from "./firebaseAdmin";
import { prisma } from "./prisma";

export async function requireUser(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer (.+)$/i);
  if (!m) throw new Response("Unauthorized", { status: 401 });
  const decoded = await adminAuth.verifyIdToken(m[1]);
  const uid = decoded.uid, email = decoded.email ?? null;
  let user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) user = await prisma.user.create({ data: { id: uid, email: email ?? undefined } });
  return user;
}

export function maskToken(token: string) {
  const tail = token.slice(-4);
  return `••••••••••••••••${tail}`;
}