import { checkCredentials, makeToken, setCookie } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });
  const { email, password } = req.body || {};
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
  }
  setCookie(res, makeToken(String(email).trim().toLowerCase()));
  res.status(200).json({ ok: true });
}
