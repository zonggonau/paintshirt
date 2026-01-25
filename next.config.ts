import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["postgres", "geoip-lite"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.printful.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**",
      },
    ],
  },
};

export default nextConfig;
