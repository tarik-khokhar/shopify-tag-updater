// api/shopify.js — Vercel Serverless Proxy for Shopify Admin API

module.exports = async function handler(req, res) {
  // CORS headers — must be first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-shopify-path, x-shopify-method');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
  const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;
  const API_VERSION   = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
    res.status(500).json({
      error: 'Missing environment variables',
      detail: `SHOPIFY_STORE=${SHOPIFY_STORE ? 'SET' : 'MISSING'}, SHOPIFY_TOKEN=${SHOPIFY_TOKEN ? 'SET' : 'MISSING'}`
    });
    return;
  }

  const shopifyPath   = req.headers['x-shopify-path'];
  const shopifyMethod = req.headers['x-shopify-method'] || 'GET';

  if (!shopifyPath) {
    res.status(400).json({ error: 'Missing x-shopify-path header' });
    return;
  }

  const shopifyUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/${shopifyPath}`;

  try {
    const fetchOptions = {
      method: shopifyMethod,
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(shopifyMethod) && req.body) {
      fetchOptions.body = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body);
    }

    const shopifyRes = await fetch(shopifyUrl, fetchOptions);
    const text = await shopifyRes.text();
    res.setHeader('Content-Type', 'application/json');
    res.status(shopifyRes.status).send(text);

  } catch (err) {
    res.status(500).json({ error: 'Proxy fetch failed', detail: err.message });
  }
};
