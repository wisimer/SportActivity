/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/shiyunhui/h5',
  publicRuntimeConfig: {
    basePath: "/shiyunhui/h5",
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://kscgc.scgchc.com/shiyunhui/h5/' : 'http://localhost:3000/shiyunhui/h5/',
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
