import type { NextConfig } from "next";

const repo = "Cityphone";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? `/${repo}` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
