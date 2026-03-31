// api/shopify.js — Vercel Serverless Proxy
// Forwards requests to Shopify Admin API so the browser avoids CORS restrictions.
// Credentials live here on the server — never exposed to the client.

export default async function handler(req, res) {
  // Allow requests from your own domain only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path, method } = req.query;

  if (!path) {
    res.status(400).json({ error: 'Missing ?path= query parameter' });
    return;
  }

  const SHOPIFY_STORE = process.env.SHOPIFY_STORE;   // yourstore.myshopify.com
  const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;   // shpat_xxxxxxxxxxxx
  const API_VERSION   = process.env.SHOPIFY_API_VERSION || '2024-10';

  if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
    res.status(500).json({ error: 'SHOPIFY_STORE or SHOPIFY_TOKEN env vars not set' });
    return;
  }

  const shopifyUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/${path}`;
  const httpMethod = method || req.method || 'GET';

  try {
    const fetchOptions = {
      method: httpMethod,
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(httpMethod) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const shopifyRes = await fetch(shopifyUrl, fetchOptions);
    const data = await shopifyRes.json();

    res.status(shopifyRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
