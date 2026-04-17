import { useTranslation } from 'next-i18next/pages';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppConfig } from '../../utils/AppConfig';
import { I18N_DEFAULT_LOCALE, I18N_LOCALES } from '../../utils/i18nConfig';

type IMetaProps = {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ro: 'ro_RO',
};

const inferImageType = (url: string) => {
  const ext = (url.split('?')[0] ?? '').split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
};

const normalizePath = (path: string) => {
  const stripped = (path.split('?')[0] ?? '').split('#')[0] ?? '';
  if (stripped === '/' || stripped === '') return '/';
  return stripped.endsWith('/') ? stripped : `${stripped}/`;
};

const localizedUrl = (locale: string, path: string) => {
  const prefix = locale === I18N_DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${AppConfig.url}${prefix}${path === '/' ? '/' : path}`;
};

const Meta = (props: IMetaProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation('seo');
  const activeLocale = i18n.language || I18N_DEFAULT_LOCALE;
  const path = normalizePath(router.asPath);

  const canonical = props.canonical ?? localizedUrl(activeLocale, path);
  const ogImage = props.ogImage ?? AppConfig.ogImage;
  const ogImageAlt = props.ogImageAlt ?? t('ogImageAlt');
  const ogImageType = inferImageType(ogImage);
  const siteName = t('siteName');
  const jsonLdItems = props.jsonLd
    ? Array.isArray(props.jsonLd)
      ? props.jsonLd
      : [props.jsonLd]
    : [];

  const alternateLocales = I18N_LOCALES.filter((l) => l !== activeLocale);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" key="charset" />
        <meta name="viewport" content="width=device-width,initial-scale=1" key="viewport" />
        <meta name="theme-color" content={AppConfig.themeColor} key="theme-color" />
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
        <link rel="manifest" href={`${router.basePath}/site.webmanifest`} key="manifest" />
        {I18N_LOCALES.map((locale) => (
          <link
            key={`hreflang-${locale}`}
            rel="alternate"
            hrefLang={locale}
            href={localizedUrl(locale, path)}
          />
        ))}
        <link
          key="hreflang-x-default"
          rel="alternate"
          hrefLang="x-default"
          href={localizedUrl(I18N_DEFAULT_LOCALE, path)}
        />
        {jsonLdItems.map((item, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw HTML injection for structured data
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
      </Head>
      <NextSeo
        title={props.title}
        description={props.description}
        canonical={canonical}
        noindex={props.noindex}
        nofollow={props.noindex}
        robotsProps={{
          maxImagePreview: 'large',
          maxSnippet: -1,
          maxVideoPreview: -1,
        }}
        openGraph={{
          type: props.ogType ?? 'website',
          title: props.title,
          description: props.description,
          url: canonical,
          locale: OG_LOCALE[activeLocale] ?? 'en_US',
          site_name: siteName,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: ogImageAlt,
              type: ogImageType,
            },
          ],
        }}
        additionalMetaTags={alternateLocales.map((l) => ({
          property: 'og:locale:alternate',
          content: OG_LOCALE[l] ?? l,
        }))}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
    </>
  );
};

export { Meta };
