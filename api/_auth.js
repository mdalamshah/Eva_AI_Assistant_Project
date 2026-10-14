const SUPABASE_URL = process.env.SUPABASE_URL || "https://iolkpnunresgnrwqgssd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";

export async function getAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !SUPABASE_KEY) return { loggedIn: false, owner: false, user: null };
  try {
    const response = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token }
    });
    if (!response.ok) return { loggedIn: false, owner: false, user: null };
    const user = await response.json();
    if (!user?.id || !user?.email) return { loggedIn: false, owner: false, user: null };
    const ownerEmail = String(process.env.EVA_OWNER_EMAIL || "mdalam67860@gmail.com").trim().toLowerCase();
    return { loggedIn: true, owner: user.email.toLowerCase() === ownerEmail, user };
  } catch {
    return { loggedIn: false, owner: false, user: null };
  }
}
