/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.openfoodfacts.org' },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  webpack: (config) => {
    // disable filesystem cache to stop missing chunk errors
    config.cache = false;
    return config;
  },
};

export default nextConfig;
