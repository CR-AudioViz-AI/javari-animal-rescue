/** @type {import('next').NextConfig} */
const nextConfig = /** @type {import('next').NextConfig} */
// { reactStrictMode: true }
module.exports = { ...nextConfig, typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } }
