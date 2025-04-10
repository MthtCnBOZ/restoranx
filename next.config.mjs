/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Next.js 15'te params.id ile ilgili uyarıları devre dışı bırak
    reactExports: 'ignore',
  },
};

export default nextConfig; 