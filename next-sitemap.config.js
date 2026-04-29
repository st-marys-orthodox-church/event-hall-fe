const { i18n } = require('./next-i18next.config');

const SITE_URL = process.env.SITE_URL || 'https://events.saintmaryro.org';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  changefreq: 'monthly',
  priority: 0.7,
  trailingSlash: true,
  exclude: ['/api/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/'] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
    ],
  },
  alternateRefs: i18n.locales.map((locale) => ({
    href: locale === i18n.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`,
    hreflang: locale,
  })),
  transform: async (config, path) => {
    const normalized = path.replace(/\/$/, '') || '/';
    const priorityMap = {
      '/': 1.0,
      '/packages': 0.9,
      '/gallery': 0.8,
    };
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorityMap[normalized] ?? config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs,
    };
  },
};
