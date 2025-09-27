import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**", // Googleプロフィール画像のすべてのパスを許可
      },
    ],
  },
};

export default nextConfig;
