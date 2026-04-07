import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /** Ẩn icon "N" góc màn hình khi chạy `next dev` (DevTools) */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

// Chi goi khi can remote proxy (dev mode thuc su voi CF remote)
// Khong goi trong build/deploy de tranh loi "Failed to start the remote proxy session"
if (process.env.NODE_ENV === 'development' && process.env.CF_REMOTE_DEV === 'true') {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
