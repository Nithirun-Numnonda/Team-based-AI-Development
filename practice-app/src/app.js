import express from 'express';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

function validateAnnouncement(input) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const body = typeof input?.body === 'string' ? input.body.trim() : '';
  const errors = [];
  if (title.length < 1 || title.length > 120) errors.push('title ต้องยาว 1–120 ตัวอักษร');
  if (body.length > 1000) errors.push('body ต้องยาวไม่เกิน 1000 ตัวอักษร');
  return { errors, value: { title, body } };
}

export function createApp({ store, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(publicDir));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: config.version,
      runtime: config.runtime,
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  app.get('/api/config', (req, res) => {
    res.json({ appTitle: config.appTitle, version: config.version, runtime: config.runtime });
  });

  app.get('/api/announcements', (req, res) => {
    res.json(store.list());
  });

  app.get('/api/announcements/:id', (req, res) => {
    const item = store.get(Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'ไม่พบประกาศ' });
    res.json(item);
  });

  app.post('/api/announcements', (req, res) => {
    const { errors, value } = validateAnnouncement(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });
    res.status(201).json(store.create(value));
  });

  app.delete('/api/announcements/:id', (req, res) => {
    if (!store.remove(Number(req.params.id))) return res.status(404).json({ error: 'ไม่พบประกาศ' });
    res.status(204).end();
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'ไม่พบ endpoint' });
  });

  // JSON ที่ส่งมาผิดรูปแบบ หรือ error อื่น ๆ — ไม่ส่ง stack trace กลับไปให้ผู้ใช้
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON ไม่ถูกต้อง' });
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
  });

  return app;
}
