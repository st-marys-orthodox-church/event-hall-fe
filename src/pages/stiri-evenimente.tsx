import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Link from 'next/link';
import type { FacebookPost } from '../utils/facebookPostsShared';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

type StiriEvenimentePageProps = {
  posts: FacebookPost[];
};

const StiriEvenimentePage = ({ posts }: StiriEvenimentePageProps) => {
  const { t, i18n } = useTranslation('facebookFeed');
  const locale = i18n.language;

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={t('seoTitle')} description={t('seoDescription')} />
      <Template topPad>
        <section className="relative overflow-hidden py-20 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,152,133,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(201,168,108,0.1),_transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <span className="eyebrow text-brand-green">{t('eyebrow')}</span>
              <h1 className="mt-4 text-4xl text-stone-900 md:text-6xl">{t('title')}</h1>
              <div className="mt-5 h-px w-16 bg-brand-green" />
              <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-600">{t('intro')}</p>
            </div>

            {posts.length > 0 ? (
              <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.facebookPostId}
                    className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-[0_24px_54px_-42px_rgba(28,25,23,0.45)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300 px-6 text-center text-stone-500">
                          {t('fallbackImage')}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-stone-100 px-6 py-4 text-sm text-stone-500">
                      {new Intl.DateTimeFormat(locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(post.createdTime))}
                    </div>

                    <div className="px-6 pb-7">
                      <h2 className="text-3xl text-stone-900">{post.title}</h2>
                      <p className="mt-5 line-clamp-5 text-base leading-8 text-stone-600">
                        {post.excerpt || post.message || t('emptyExcerpt')}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        {post.isRepost ? (
                          <span className="rounded-sm border border-sky-200 bg-sky-50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-sky-700">
                            {t('repostLabel')}
                          </span>
                        ) : (
                          <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
                            {t('facebookSource')}
                          </span>
                        )}
                        <Link
                          href={post.permalinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium uppercase tracking-[0.18em] text-brand-green transition-colors duration-300 hover:text-brand-gold"
                        >
                          {t('readMore')} →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-sm border border-stone-200 bg-white px-6 py-8 text-stone-700 shadow-[0_24px_54px_-42px_rgba(28,25,23,0.45)]">
                <p className="font-medium">{t('emptyTitle')}</p>
                <p className="mt-2 leading-7 text-stone-600">{t('emptyBody')}</p>
              </div>
            )}
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<StiriEvenimentePageProps> = async ({
  locale,
}) => {
  const { listFacebookPosts } = await import('../server/facebookPostsStore');

  return {
    props: {
      ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
        'common',
        'facebookFeed',
      ])),
      posts: listFacebookPosts(24),
    },
  };
};

export default StiriEvenimentePage;
