// api/shopify.js — Vercel Serverless Proxy v5

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const STORE   = process.env.SHOPIFY_STORE;
  const TOKEN   = process.env.SHOPIFY_TOKEN;
  const VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

  // Debug endpoint
  if (req.query.debug) {
    res.status(200).json({
      status: 'proxy running',
      SHOPIFY_STORE: STORE  ? 'SET ('+STORE+')' : 'MISSING',
      SHOPIFY_TOKEN: TOKEN  ? 'SET (hidden)'     : 'MISSING',
      API_VERSION:   VERSION,
    });
    return;
  }

  if (!STORE || !TOKEN) {
    res.status(500).json({ error: 'Missing env vars', SHOPIFY_STORE: STORE?'SET':'MISSING', SHOPIFY_TOKEN: TOKEN?'SET':'MISSING' });
    return;
  }

  const shopifyPath   = req.query.p;
  const shopifyMethod = (req.query.m || 'GET').toUpperCase();

  if (!shopifyPath) {
    res.status(400).json({ error: 'Missing ?p= query param' });
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

    if (['POST', 'PUT', 'PATCH'].includes(shopifyMethod) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const r = await fetch(shopifyUrl, options);
    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', 'application/json').send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
