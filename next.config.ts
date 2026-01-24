import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["postgres"],
  // @ts-ignore - Valid in Next.js but might not be typed in this version
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.cdn.printful.com",
        port: "",
        pathname: "/files/**",
      },
    ],
  },
};

export default nextConfig;
