/* LILITH — reservation email via Resend.
   Key lives in the RESEND_API_KEY env var (set in Vercel, never in the repo). */
export default async function handler(req, res){
  if(req.method !== 'POST'){ res.status(405).json({ error: 'Method not allowed' }); return; }
  const key = process.env.RESEND_API_KEY;
  if(!key){ res.status(500).json({ error: 'Email not configured' }); return; }

  let b = req.body;
  if(typeof b === 'string'){ try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  const esc = s => String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;' }[c]));

  const kind    = b.kind    || 'Preorder reservation';
  const product = b.product || 'LILITH piece';
  const rows = [
    ['Type', kind], ['Product', product], ['Details', b.summary], ['Price', b.price],
    ['Name', [b.first, b.last].filter(Boolean).join(' ') || b.name],
    ['Email', b.email], ['Phone / WhatsApp', b.phone], ['Ring size', b.size],
    ['Country', b.country], ['Engraving', b.engraving], ['Reservation no.', b.order],
  ].filter(r => r[1]);

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:540px;margin:auto">
    <h2 style="font-family:Georgia,serif;color:#1a120e;border-bottom:2px solid #6e1020;padding-bottom:10px">
      LILITH — new ${esc(kind).toLowerCase()}</h2>
    <table style="border-collapse:collapse;width:100%;margin-top:12px">
      ${rows.map(([k,v]) => `<tr>
        <td style="padding:8px 12px;color:#8a7d73;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top">${esc(k)}</td>
        <td style="padding:8px 12px;color:#1a120e;border-bottom:1px solid #eee">${esc(v)}</td></tr>`).join('')}
    </table>
    <p style="color:#8a7d73;font-size:12px;margin-top:18px">Sent from lilithmaison.com</p>
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'LILITH <onboarding@resend.dev>',
        to: ['zzeidnaser@gmail.com'],
        reply_to: b.email || undefined,
        subject: `New ${kind} — ${product}`,
        html
      })
    });
    const data = await r.json();
    if(!r.ok){ res.status(502).json({ error: data }); return; }
    res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
