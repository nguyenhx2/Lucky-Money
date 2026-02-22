import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'inchi.vn' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      // Fallback: serve .jpg requests from .webp files (assets were optimized)
      {
        source: '/assets/li-xi/:name(.*)\\.jpg',
        destination: '/assets/li-xi/:name.webp',
      },
      {
        source: '/assets/thiep/:name(.*)\\.jpg',
        destination: '/assets/thiep/:name.webp',
      },
      {
        source: '/background/:name(.*)\\.jpg',
        destination: '/background/:name.webp',
      },
    ]
  },
}

export default nextConfig
