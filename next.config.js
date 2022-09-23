/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  basePath: "/course-grapher", // TODO: remove when hosting on a separate domain
}

module.exports = nextConfig
