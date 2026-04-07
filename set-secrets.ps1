# Script to set Cloudflare Worker secrets
# Run this ONCE from your local machine (not in CI/CD)

# Set DATABASE_URL
npx wrangler secret put DATABASE_URL --name game81

# Set GROQ_API_KEY  
npx wrangler secret put GROQ_API_KEY --name game81

# Set other secrets
npx wrangler secret put ADMIN_EMAIL --name game81
npx wrangler secret put ADMIN_PASSWORD --name game81
npx wrangler secret put SEED_SECRET --name game81

# Note: NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_GOOGLE_ANALYTICS_ID are set in wrangler.jsonc vars (non-secret)
# Or add to wrangler.jsonc vars section (non-sensitive only)

Write-Host "Done! Secrets are now set and will persist across deployments."
