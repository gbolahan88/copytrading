// lib/deriv.ts
export async function validateToken(token: string): Promise<boolean> {
  // Replace with real Deriv auth check
  return Boolean(token && token.length > 10);
}