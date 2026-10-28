import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  reactStrictMode: true,
  reactCompiler: true,
  // rewrites rule for production
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://hemacue-backend.vercel.app/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
