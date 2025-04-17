import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 enables static export
  reactStrictMode: true, // optional but good for dev
  trailingSlash: true, // 👈 required for S3 to resolve folders correctly
};

export default nextConfig;