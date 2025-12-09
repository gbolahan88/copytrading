// app/api/tokens/copier/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { requireUser, maskToken } from "../../../../../../lib/auth";
import { validateToken } from "../../../../../../lib/deriv";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  const { id } = await params;
  const existing = await prisma.copierToken.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) 
    return new NextResponse("Not found", { status: 404 });

  const body = await req.json() as { 
    label?: string; 
    token?: string; 
    accountType?: "REAL"|"DEMO"; 
    isActive?: boolean 
  };

  let validatedAt = existing.validatedAt;

  if (body.token && body.token !== existing.CopierToken) {
    validatedAt = (await validateToken(body.token)) ? new Date() : null;
  }

  const updated = await prisma.copierToken.update({
    where: { id },
    data: { 
      label: body.label ?? existing.label, 
      CopierToken: body.token ?? existing.CopierToken, 
      accountType: body.accountType ?? existing.accountType, 
      isActive: body.isActive ?? existing.isActive, 
      validatedAt 
    },
  });

  return NextResponse.json({ 
    ...updated, 
    token: maskToken(updated.CopierToken), 
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req);
  const { id } = await params;
  const existing = await prisma.copierToken.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) return new NextResponse("Not found", { status: 404 });
  await prisma.copierToken.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}