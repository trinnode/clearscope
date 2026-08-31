/** @type {import('next').NextConfig} */
const nextConfig = process.env.STANDALONE
  ? { output: 'standalone' }
  : {}

module.exports = nextConfig