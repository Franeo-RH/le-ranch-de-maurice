import { requireAdmin } from './_auth.js';
import { readData, writeData } from './_store.js';
import { storeError } from './_store.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Méthode non autorisée' });
  try {
    const b = req.body || {};
    const items = (Array.isArray(b.items) ? b.items : [])
      .map((s) => String(s || '').trim().slice(0, 80)).filter(Boolean).slice(0, 60);
    const produits = { items, note: String(b.note || '').trim().slice(0, 200), updated: new Date().toISOString().slice(0, 10) };
    const d = await readData();
    d.produits = produits;
    await writeData(d);
    res.status(200).json({ produits });
  } catch (e) {
    storeError(res, e);
  }
}
