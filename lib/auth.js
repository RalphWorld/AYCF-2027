import bcrypt from "bcryptjs";

// Key hashing — used only inside API routes (Node.js runtime), never in
// middleware. For signed session cookies, see lib/session.js instead.

export async function hashKey(plainKey) {
  return bcrypt.hash(String(plainKey), 10);
}

export async function verifyKey(plainKey, hash) {
  if (!plainKey || !hash) return false;
  return bcrypt.compare(String(plainKey), hash);
}
