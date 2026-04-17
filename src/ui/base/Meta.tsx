import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppConfig } from '../../utils/AppConfig';

type IMetaProps = {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const normalizePath = (path: string) => {
  const stripped = (path.split('?')[0] ?? '').split('#')[0] ?? '';
  if (stripped === '/' || stripped === '') return '/';
  return stripped.endsWith('/') ? stripped : `${stripped}/`;
};

const Meta = (props: IMetaProps) => {
  const router = useRouter();
  const canonical = props.canonical ?? `${AppConfig.url}${normalizePath(router.asPath)}`;
  const jsonLdItems = props.jsonLd
    ? Array.isArray(props.jsonLd)
      ? props.jsonLd
      : [props.jsonLd]
    : [];

  return (
    <>
      <Head>
        <meta charSet="UTF-8" key="charset" />
        <meta name="viewport" content="width=device-width,initial-scale=1" key="viewport" />
        <link rel="preconnect" href="https://www.google.com" key="preconnect-google" />
        <link
          rel="preconnect"
          href="https://maps.googleapis.com"
          crossOrigin="anonymous"
          key="preconnect-maps"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${router.basePath}/apple-touch-icon.png`}
          key="apple"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`${router.basePath}/favicon.svg`}
          key="icon-svg"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href={`${router.basePath}/favicon-96x96.png`}
          key="icon96"
        />
        <link rel="icon" href={`${router.basePath}/favicon.ico`} key="favicon" />
        <link
          rel="manifest"
          href={`${router.basePath}/site.webmanifest`}
          key="manifest"
        />
        {jsonLdItems.map((item, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
      </Head>
      <NextSeo
        title={props.title}
        description={props.description}
        canonical={canonical}
        openGraph={{
          type: props.ogType ?? 'website',
          title: props.title,
          description: props.description,
          url: canonical,
          locale: AppConfig.locale,
          site_name: AppConfig.site_name,
          images: [
            {
              url: AppConfig.logo,
              width: 1200,
              height: 630,
              alt: AppConfig.site_name,
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
    </>
  );
};

export { Meta };
