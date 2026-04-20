import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Cloudflare R2 prod
      {
        protocol: "https",
        hostname: "cdn.ekimcraft.com",
      },
      // Dev: Django media
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  // Backend'e proxy (dev için /api/backend → :8000/api/v1)
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
