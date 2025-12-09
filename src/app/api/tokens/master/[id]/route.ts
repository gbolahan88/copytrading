// app/api/tokens/master/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { requireUser, maskToken } from "../../../../../../lib/auth";
import { validateToken } from "../../../../../../lib/deriv";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  const { id } = await params;
  const existing = await prisma.masterToken.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) return new NextResponse("Not found", { status: 404 });
  const body = await req.json() as { label?: string; token?: string; accountType?: "REAL"|"DEMO"; isActive?: boolean };
  let validatedAt = existing.validatedAt;
  if (body.token && body.token !== existing.token) validatedAt = (await validateToken(body.token)) ? new Date() : null;
  const updated = await prisma.masterToken.update({
    where: { id },
    data: { label: body.label ?? existing.label, token: body.token ?? existing.token, accountType: body.accountType ?? existing.accountType, isActive: body.isActive ?? existing.isActive, validatedAt },
  });
  return NextResponse.json({ ...updated, token: maskToken(updated.token) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  const { id } = await params;
  const existing = await prisma.masterToken.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) return new NextResponse("Not found", { status: 404 });
  await prisma.masterToken.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}