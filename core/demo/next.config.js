/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Vercel deployment compatible settings
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: true
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  }
};

module.exports = nextConfig;
