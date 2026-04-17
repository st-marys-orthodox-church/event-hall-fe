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
  i18n,
};

module.exports = withBundleAnalyzer(nextConfig);
