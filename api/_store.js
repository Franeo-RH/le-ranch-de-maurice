import { put, list, del } from '@vercel/blob';

const PREFIX = 'site/data-';
const empty = () => ({ posts: [], hidden: [], produits: null });

async function versions() {
  const { blobs } = await list({ prefix: PREFIX, limit: 100 });
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function readData() {
  const all = await versions();
  if (!all.length) return empty();
  const r = await fetch(all[0].url, { cache: 'no-store' });
  if (!r.ok) throw new Error('Lecture impossible');
  const d = await r.json();
  return {
    posts: Array.isArray(d.posts) ? d.posts : [],
    hidden: Array.isArray(d.hidden) ? d.hidden : [],
    produits: d.produits || null,
  };
}

// Chaque enregistrement crée un nouveau fichier (nom horodaté) : jamais de version en cache.
export async function writeData(d) {
  const name = PREFIX + String(Date.now()).padStart(15, '0') + '.json';
  await put(name, JSON.stringify(d), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  const all = await versions();
  const old = all.filter((b) => b.pathname !== name).map((b) => b.url);
  if (old.length) { try { await del(old); } catch {} }
}

export async function savePhoto(id, buf, type) {
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const r = await put(`photos/${id}.${ext}`, buf, { access: 'public', addRandomSuffix: true, contentType: type });
  return r.url;
}

export async function removePhoto(url) {
  if (typeof url === 'string' && url.startsWith('https://')) { try { await del(url); } catch {} }
}
