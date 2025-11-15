/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Chrome拡張機能用の設定
  assetPrefix: "./",
  trailingSlash: true,
};

module.exports = nextConfig;
