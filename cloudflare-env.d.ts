import type { D1Database } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    game81_db: D1Database;
    ASSETS: Fetcher;
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
  }
}
