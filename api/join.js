export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://budpal.world");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

  try {
    const { email } = req.body || {};
    const clean = String(email||"").trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    if (!valid) return res.status(400).json({ ok:false, error:"Invalid email" });

    const r = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        "Content-Type":"application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        list_ids: [process.env.SENDGRID_LIST_ID],
        contacts: [{ email: clean }]
      })
    });

    if (!r.ok) return res.status(500).json({ ok:false, error:"SendGrid error", details: await r.text() });
    res.status(200).json({ ok:true, message:"Added to waitlist" });
  } catch (e) {
    res.status(500).json({ ok:false, error:e.message });
  }
}
