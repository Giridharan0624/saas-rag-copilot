import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Optional: Disable image optimization if using standard <img> layouts on static hosts
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
