// Session token sign/verify using Web Crypto (crypto.subtle), so this works
// in both the Edge middleware runtime and normal Node.js API routes.
//
// Token shape: "<role>.<expiresAt>.<signatureHex>"

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecretBytes() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET env var");
  return new TextEncoder().encode(secret);
}

async function getHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    getSecretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

export async function createSessionToken(role) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${role}.${expiresAt}`;
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${bytesToHex(sig)}`;
}

export async function verifySessionToken(token, expectedRole) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresAt, sigHex] = parts;
  if (role !== expectedRole) return false;
  if (Date.now() > Number(expiresAt)) return false;

  const payload = `${role}.${expiresAt}`;
  const key = await getHmacKey();
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(sigHex),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export const SITE_COOKIE = "aycf_site_session";
export const ADMIN_COOKIE = "aycf_admin_session";
