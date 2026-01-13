import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Set the root directory to avoid workspace detection issues
    root: __dirname,
  },
};

export default nextConfig;
