import crypto from 'node:crypto';
import { requireAdmin } from './_auth.js';
import { readData, writeData, savePhoto, removePhoto } from './_store.js';

const today = () => new Date().toISOString().slice(0, 10);
const clean = (v, n) => String(v || '').trim().slice(0, n);

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  try {
    if (req.method === 'POST') {
      const b = req.body || {};
      const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(b.image || '');
      if (!m) return res.status(400).json({ error: 'Choisissez une photo au format JPEG ou PNG.' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 3.5 * 1024 * 1024) return res.status(400).json({ error: 'Photo trop lourde.' });
      const id = 'w' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
      const photo = await savePhoto(id, buf, m[1]);
      const ig = clean(b.instagram, 300);
      const post = {
        id,
        date: /^\d{4}-\d{2}-\d{2}$/.test(b.date || '') ? b.date : today(),
        title: clean(b.title, 120),
        text: clean(b.text, 2000),
        instagram: /^https:\/\/(www\.)?instagram\.com\/\S+$/i.test(ig) ? ig : '',
        photo,
      };
      const d = await readData();
      d.posts.push(post);
      await writeData(d);
      return res.status(200).json({ post });
    }
    if (req.method === 'DELETE') {
      const id = clean(req.query && req.query.id, 80);
      if (!id) return res.status(400).json({ error: 'Publication introuvable.' });
      const d = await readData();
      const own = d.posts.find((p) => p.id === id);
      if (own) {
        d.posts = d.posts.filter((p) => p.id !== id);
        await removePhoto(own.photo);
      } else if (!d.hidden.includes(id)) {
        d.hidden.push(id);
      }
      await writeData(d);
      return res.status(200).json({ ok: true, posts: d.posts, hidden: d.hidden });
    }
    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}
