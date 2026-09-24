const { i18n } = require('./next-i18next.config');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  // Turbopack bundles MUI's ESM entry on the server with its own copy of
  // Emotion, while app code gets Node's copy. Two copies mean two React
  // contexts, so MUI never saw the SSR cache and hydration mismatched
  // (`css-` on the server, `mui-` on the client). Bundling Emotion for app
  // code as well keeps a single instance.
  transpilePackages: ['@emotion/react', '@emotion/styled', '@emotion/cache'],
  i18n,
  images: {
    // Cloudflare image ids are immutable, so optimized copies can live a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
