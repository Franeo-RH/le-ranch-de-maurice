import crypto from 'node:crypto';

const COOKIE = 'rdm_admin';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

const hash = (v) => crypto.createHash('sha256').update(String(v)).digest();

function secret() {
  const s = process.env.SESSION_SECRET || '';
  if (s.length >= 16) return s;
  const p = process.env.ADMIN_PASSWORD || '';
  if (!p) throw new Error('ADMIN_PASSWORD manquant');
  return hash('rdm-session:' + p).toString('hex');
}

const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('base64url');

export function checkCredentials(email, password) {
  const E = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const P = process.env.ADMIN_PASSWORD || '';
  if (!E || !P) return false;
  const okE = crypto.timingSafeEqual(hash(String(email || '').trim().toLowerCase()), hash(E));
  const okP = crypto.timingSafeEqual(hash(password || ''), hash(P));
  return okE && okP;
}

export function makeToken(email) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return payload + '.' + sign(payload);
}

export function readToken(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [p, s] = decodeURIComponent(raw.slice(COOKIE.length + 1)).split('.');
  if (!p || !s) return null;
  let good;
  try { good = sign(p); } catch { return null; }
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.x > Date.now() ? d : null;
  } catch { return null; }
}

export function setCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

export function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export function requireAdmin(req, res) {
  const d = readToken(req);
  if (!d) { res.status(401).json({ error: 'Non connecté' }); return null; }
  return d;
}
