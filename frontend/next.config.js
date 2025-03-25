/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'], // Add your backend domain
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig 