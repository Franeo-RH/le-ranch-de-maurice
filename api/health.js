export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    stockage_photos_blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    identifiants_admin: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
  });
}
