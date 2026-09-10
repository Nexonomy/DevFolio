/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/blob',
        search: 'pathname=*',
      },
    ],
  },
};

export default nextConfig;
