/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  server: {
    port: 12000,
    host: '0.0.0.0',
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Permissions-Policy", value: "clipboard-read=* , clipboard-write=*" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "*" },
      ],
    },
  ],
}

export default nextConfig
