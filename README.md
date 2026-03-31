# Shopify Tag Updater

Bulk-update Shopify product prices, costs, and metafields by product tag.

## Files

```
shopify-tag-updater/
├── index.html        ← The app UI
├── api/
│   └── shopify.js    ← Vercel serverless proxy (handles CORS + keeps credentials safe)
└── vercel.json       ← Vercel routing config
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import the repo at vercel.com
3. Add these Environment Variables in Vercel dashboard:
   - `SHOPIFY_STORE` = `yourstore.myshopify.com`
   - `SHOPIFY_TOKEN` = `shpat_xxxxxxxxxxxxxx`
   - `SHOPIFY_API_VERSION` = `2024-10` (optional, defaults to 2024-10)
4. Deploy — your app URL will be `https://your-project.vercel.app`
5. In the app, set Proxy URL to: `https://your-project.vercel.app/api/shopify`

## Shopify API Scopes Required

- `read_products`
- `write_products`
- `read_inventory`
- `write_inventory`
