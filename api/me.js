import { readToken } from './_auth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!readToken(req)) return res.status(401).json({ error: 'Non connecté' });
  res.status(200).json({ ok: true });
}
