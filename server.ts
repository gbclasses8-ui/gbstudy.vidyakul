import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory cache for tokens and API responses
let cachedToken: { token: string; expires_at: number } | null = null;
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Upstream URL for GB STUDY content
const UPSTREAM_BASE = 'https://batkul.lovable.app';

// Helper to obtain or refresh X-GB-Token
async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expires_at - 60000 > now) {
    return cachedToken.token;
  }

  try {
    const authRes = await fetch(`${UPSTREAM_BASE}/api/public/gb-auth`, {
      headers: {
        Referer: `${UPSTREAM_BASE}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GB-STUDY-App',
      },
    });

    if (!authRes.ok) {
      throw new Error(`Auth failed with status ${authRes.status}`);
    }

    const data = await authRes.json();
    if (data && data.token) {
      cachedToken = {
        token: String(data.token),
        expires_at: Number(data.expires_at) || now + 3600000,
      };
      return cachedToken.token;
    }
  } catch (err) {
    console.error('Error fetching auth token:', err);
  }

  // Return existing token if available as fallback
  if (cachedToken) {
    return cachedToken.token;
  }
  return '';
}

// Load seed batches with deduplication
let localBatches: any[] = [];
try {
  const seedPath = path.resolve(__dirname, 'src/data/batches-seed.json');
  if (fs.existsSync(seedPath)) {
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const seen = new Set<string>();
      localBatches = parsed.filter((b: any) => {
        if (!b || !b.id || seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
    }
  }
} catch (e) {
  console.error('Error loading seed batches:', e);
}

// Helper to decode video URL from base64 if needed
function resolveStreamUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/api/media-proxy?u=')) {
    const encoded = url.substring('/api/media-proxy?u='.length);
    try {
      const decoded = Buffer.from(decodeURIComponent(encoded), 'base64').toString('utf-8');
      if (decoded.startsWith('http')) {
        return decoded;
      }
    } catch {}
  }
  return url;
}

// API Routes
app.get('/api/batches', async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const classFilter = typeof req.query.class === 'string' ? req.query.class.trim().toLowerCase() : '';

    let results = [...localBatches];

    if (q) {
      results = results.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(q)) ||
          (b.slug && b.slug.toLowerCase().includes(q)) ||
          (b.by_name && b.by_name.toLowerCase().includes(q))
      );
    }

    if (classFilter && classFilter !== 'all') {
      if (classFilter === '12th' || classFilter === '12') {
        results = results.filter((b) => /12|12th|१२|12वीं/i.test(b.name || ''));
      } else if (classFilter === '10th' || classFilter === '10') {
        results = results.filter((b) => /10|10th|१०|10वीं/i.test(b.name || ''));
      } else if (classFilter === '11th' || classFilter === '11') {
        results = results.filter((b) => /11|11th|११|11वीं/i.test(b.name || ''));
      } else if (classFilter === '9th' || classFilter === '9') {
        results = results.filter((b) => /9|9th|९|9वीं/i.test(b.name || ''));
      } else if (classFilter === 'kunji') {
        results = results.filter((b) => /kunji|कुंजी|unsolved/i.test(b.name || ''));
      } else if (classFilter === 'hunkaar') {
        results = results.filter((b) => /hunkaar|हुंकार/i.test(b.name || ''));
      }
    }

    res.json({
      status: true,
      total: results.length,
      batches: results,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message, batches: localBatches });
  }
});

// GET /api/batch/:batchId
app.get('/api/batch/:batchId', (req: Request, res: Response) => {
  const { batchId } = req.params;
  const found = localBatches.find((b) => b.id === batchId || b.slug === batchId);
  if (found) {
    res.json({ status: true, batch: found });
  } else {
    res.status(404).json({ status: false, error: 'Batch not found' });
  }
});

// GET /api/subjects?batch_id=...
app.get('/api/subjects', async (req: Request, res: Response) => {
  const batchId = String(req.query.batch_id || '');
  if (!batchId) {
    return res.status(400).json({ status: false, error: 'batch_id is required' });
  }

  const cacheKey = `subjects:${batchId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const token = await getAuthToken();
    const upstreamRes = await fetch(
      `${UPSTREAM_BASE}/api/public/cds/subjects?batch_id=${encodeURIComponent(batchId)}`,
      {
        headers: {
          'X-GB-Token': token,
          Referer: `${UPSTREAM_BASE}/`,
          Accept: 'application/json',
        },
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(`Upstream subjects error ${upstreamRes.status}`);
    }

    const data = await upstreamRes.json();
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err: any) {
    console.error('Subjects fetch error:', err.message);
    if (cached) {
      return res.json(cached.data);
    }
    res.status(502).json({
      status: false,
      error: 'Unable to fetch subjects at this moment. Please retry.',
      subjects: [],
    });
  }
});

// GET /api/chapters?batch_id=...&subject_id=...
app.get('/api/chapters', async (req: Request, res: Response) => {
  const batchId = String(req.query.batch_id || '');
  const subjectId = String(req.query.subject_id || '');
  if (!batchId || !subjectId) {
    return res.status(400).json({ status: false, error: 'batch_id and subject_id are required' });
  }

  const cacheKey = `chapters:${batchId}:${subjectId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const token = await getAuthToken();
    const upstreamRes = await fetch(
      `${UPSTREAM_BASE}/api/public/cds/chapters?batch_id=${encodeURIComponent(
        batchId
      )}&subject_id=${encodeURIComponent(subjectId)}`,
      {
        headers: {
          'X-GB-Token': token,
          Referer: `${UPSTREAM_BASE}/`,
          Accept: 'application/json',
        },
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(`Upstream chapters error ${upstreamRes.status}`);
    }

    const data = await upstreamRes.json();
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err: any) {
    console.error('Chapters fetch error:', err.message);
    if (cached) {
      return res.json(cached.data);
    }
    res.status(502).json({
      status: false,
      error: 'Unable to fetch chapters at this moment. Please retry.',
      chapters: [],
    });
  }
});

// GET /api/lectures?batch_id=...&subject_id=...&chapter_id=...
app.get('/api/lectures', async (req: Request, res: Response) => {
  const batchId = String(req.query.batch_id || '');
  const subjectId = String(req.query.subject_id || '');
  let chapterId = String(req.query.chapter_id || '');

  if (!batchId || !subjectId) {
    return res.status(400).json({ status: false, error: 'batch_id and subject_id are required' });
  }

  // Default to 'All Chapters' if not specified or requested as all
  if (!chapterId || chapterId === 'all') {
    chapterId = 'All Chapters';
  }

  const cacheKey = `lectures:${batchId}:${subjectId}:${chapterId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const token = await getAuthToken();
    const upstreamRes = await fetch(
      `${UPSTREAM_BASE}/api/public/cds/lectures?batch_id=${encodeURIComponent(
        batchId
      )}&subject_id=${encodeURIComponent(subjectId)}&chapter_id=${encodeURIComponent(chapterId)}&_v=5`,
      {
        headers: {
          'X-GB-Token': token,
          Referer: `${UPSTREAM_BASE}/`,
          Accept: 'application/json',
        },
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(`Upstream lectures error ${upstreamRes.status}`);
    }

    const data = await upstreamRes.json();
    if (data.lectures && Array.isArray(data.lectures)) {
      // Enhance lectures with decoded direct video streams
      data.lectures = data.lectures.map((lec: any) => {
        const streamUrl = resolveStreamUrl(lec.video_url);
        const resolvedVideoUrls = Array.isArray(lec.video_urls)
          ? lec.video_urls.map((u: string) => resolveStreamUrl(u))
          : [streamUrl].filter(Boolean);

        return {
          ...lec,
          stream_url: streamUrl,
          resolved_video_urls: resolvedVideoUrls,
        };
      });
    }

    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err: any) {
    console.error('Lectures fetch error:', err.message);
    if (cached) {
      return res.json(cached.data);
    }
    res.status(502).json({
      status: false,
      error: 'Unable to fetch lectures at this moment. Please retry.',
      lectures: [],
    });
  }
});

// GET /api/pdf-proxy?url=...
// Streams PDF with application/pdf and Content-Disposition: inline so it displays directly in iframe/browser
app.get('/api/pdf-proxy', async (req: Request, res: Response) => {
  const targetUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid PDF URL');
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GB-STUDY-App',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Failed to fetch PDF from upstream');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="GB-STUDY-Notes.pdf"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('PDF proxy error:', err);
    res.status(500).send('Error proxying PDF document');
  }
});

// App configuration endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    appName: 'GB STUDY',
    telegramUrl: 'https://t.me/GBFreestudy',
    iconUrl: 'https://i.ibb.co/0R7qc34v/1093.jpg',
    theme: 'pink',
    totalBatches: localBatches.length,
  });
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GB STUDY Server running at http://0.0.0.0:${PORT} [${isProd ? 'PROD' : 'DEV'}]`);
  });
}

startServer();
