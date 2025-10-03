import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel環境でのAPI関数設定
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**", // Googleプロフィール画像のすべてのパスを許可
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**", // DiceBear API（アバター生成）
      },
    ],
  },
};

export default nextConfig;
