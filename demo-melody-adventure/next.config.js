/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/midi/:path*',
        destination: 'http://127.0.0.1:5328/midi/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5328/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=300',
          },
        ],
      },
    ]
  },
  experimental: {
    proxyTimeout: 300000,
    serverTimeout: 300000,
  },
}

module.exports = nextConfig
