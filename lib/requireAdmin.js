import { verifySessionToken, ADMIN_COOKIE } from "./session";

// Call at the top of any admin API route. Returns true if the request has a
// valid admin session cookie, false otherwise.
export async function hasAdminSession(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token, "admin");
}
