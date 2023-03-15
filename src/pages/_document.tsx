import { NextSeo } from 'next-seo';
import Document, { Html, Head, Main, NextScript } from 'next/document';

import { AppConfig } from '../utils/AppConfig';

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
          <NextSeo
            title={AppConfig.site_name}
            description={AppConfig.description}
            canonical="https://www.canonical.ie/"
            openGraph={{
              url: AppConfig.url,
              title: AppConfig.site_name,
              description: AppConfig.description,
              images: [
                {
                  url: 'https://events.saintmaryro.org/logos/logo.jpg',
                  width: 1558,
                  height: 414,
                  alt: 'Fellowship Event Hall',
                  type: 'image/jpg',
                },
              ],
              siteName: AppConfig.site_name,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
