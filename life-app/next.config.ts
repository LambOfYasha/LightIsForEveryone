import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const consolePrefixes = [
  "advanced-moderation",
  "analytics",
  "blogs",
  "communities",
  "feedback",
  "help-tickets",
  "lessons",
  "moderation",
  "pages",
  "reports",
  "settings",
  "tags",
  "teachers",
  "testing",
  "users",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    localPatterns: [
      { pathname: '/cms-api/media/file/**' },
      { pathname: '/assets/**' },
    ],
  },
  async redirects() {
    return [
      { source: '/studio', destination: '/admin', permanent: false },
      { source: '/studio/:path*', destination: '/admin/:path*', permanent: false },
      ...consolePrefixes.flatMap((prefix) => [
        { source: `/admin/${prefix}`, destination: `/manage/${prefix}`, permanent: false },
        { source: `/admin/${prefix}/:path*`, destination: `/manage/${prefix}/:path*`, permanent: false },
      ]),
    ];
  },
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
} as NextConfig;

export default withPayload(nextConfig);