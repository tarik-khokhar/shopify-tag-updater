// api/shopify.js — Vercel Serverless Proxy v3

module.exports = async function handler(req, res) {
  // ── CORS — must handle OPTIONS preflight first ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-shopify-path,x-shopify-method');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // ── Env vars ──
  const STORE   = process.env.SHOPIFY_STORE;
  const TOKEN   = process.env.SHOPIFY_TOKEN;
  const VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!STORE || !TOKEN) {
    res.status(500).json({
      error: 'Missing env vars',
      SHOPIFY_STORE:  STORE  ? 'SET' : 'MISSING',
      SHOPIFY_TOKEN:  TOKEN  ? 'SET' : 'MISSING',
    });
    return;
  }

  // ── Read Shopify path + method from headers ──
  const shopifyPath   = req.headers['x-shopify-path'];
  const shopifyMethod = (req.headers['x-shopify-method'] || 'GET').toUpperCase();

  if (!shopifyPath) {
    res.status(400).json({ error: 'Missing x-shopify-path header' });
    return;
  }

  const shopifyUrl = `https://${STORE}/admin/api/${VERSION}/${shopifyPath}`;

  try {
    const options = {
      method: shopifyMethod,
      headers: {
        'X-Shopify-Access-Token': TOKEN,
        'Content-Type': 'application/json',
      },
    };

    // Attach body for write operations
    if (['POST', 'PUT', 'PATCH'].includes(shopifyMethod)) {
      // Vercel parses JSON body automatically — re-stringify it
      if (req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }
    }

    const r = await fetch(shopifyUrl, options);
    const text = await r.text();

    res.status(r.status)
       .setHeader('Content-Type', 'application/json')
       .send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
