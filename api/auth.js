import { getAuth } from "./_auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const auth = await getAuth(req);
  if (!auth.loggedIn) return res.status(200).json({ role: "guest", name: "" });
  return res.status(200).json({
    role: auth.owner ? "owner" : "user",
    name: auth.user.user_metadata?.full_name || auth.user.email,
    email: auth.user.email,
    emailVerified: Boolean(auth.user.email_confirmed_at)
  });
}
