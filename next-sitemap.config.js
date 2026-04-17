/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://events.saintmaryro.org',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  priority: 0.7,
  trailingSlash: true,
  exclude: ['/api/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/'] },
    ],
  },
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
    };
  },
};
