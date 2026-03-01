const { z } = require('zod');
const crypto = require('crypto');
const supabase = require('../utils/supabaseAdmin');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_FOLDERS = new Set(['topics', 'lessons', 'attachments']);

function safeExtFromMime(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'application/pdf') return 'pdf';
  return null;
}

function randomId() {
  return crypto.randomBytes(16).toString('hex');
}

const schema = z.object({
  contentType: z.string().min(1),
  size: z.number().int().min(1),
  folder: z.string().min(1),
  // опционально — если хотите контролировать расширение от фронта
  ext: z.string().optional(),
  filename: z.string().optional(),
});

exports.createSignedUpload = async (req, res, next) => {
  try {
    const body = schema.parse(req.body);

    const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024);
    if (body.size > maxBytes) {
      return res.status(413).json({ error: `File too large. Max ${maxBytes} bytes` });
    }

    if (!ALLOWED_FOLDERS.has(body.folder)) {
      return res.status(400).json({ error: 'Invalid folder' });
    }

    if (!ALLOWED_MIME.has(body.contentType)) {
      return res.status(400).json({ error: 'Unsupported contentType' });
    }

    const bucket = process.env.SUPABASE_BUCKET || 'kidsai';

    // расширение безопасно берём от mime (а не доверяем фронту)
    const ext = safeExtFromMime(body.contentType);
    if (!ext) return res.status(400).json({ error: 'Cannot determine file extension' });

    // Пример путей:
    // topics/<uuid>.jpg
    // lessons/<uuid>.png
    // attachments/<uuid>.pdf
    const path = `${body.folder}/${randomId()}.${ext}`;

    // Supabase signed upload URL (valid ~ 2 hours) :contentReference[oaicite:1]{index=1}
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Если bucket public — можно сразу построить public URL:
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);

    res.json({
      bucket,
      path,
      signedUrl: data.signedUrl,
      token: data.token,        // может пригодиться, если будете использовать uploadToSignedUrl
      publicUrl: publicData?.publicUrl || null,
      expiresInSeconds: 2 * 60 * 60,
    });
  } catch (err) {
    next(err);
  }
};