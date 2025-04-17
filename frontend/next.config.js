/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rentrealm-backend.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
