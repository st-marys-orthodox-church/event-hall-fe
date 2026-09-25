import { FormatQuote, Star } from '@mui/icons-material';
import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import { TIMING } from '../../utils/DesignTokens';
import {
  GOOGLE_REVIEWS_URL,
  type IReviewMeta,
  REVIEWS,
  REVIEW_AVATARS,
  reviewerInitials,
} from '../../utils/Reviews';
import { Reveal } from '../components/Reveal';

const StarRow = ({ rating, label }: { rating: number; label: string }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={label}>
    {Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="text-brand-gold" fontSize="small" aria-hidden />
    ))}
  </div>
);

const AVATAR_PX = 44;

const Avatar = ({ src, name }: { src?: string; name: string }) => {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={AVATAR_PX}
        height={AVATAR_PX}
        className="shrink-0 m-0 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="shrink-0 rounded-full bg-brand-green/15 text-brand-green-ink font-medium text-sm flex items-center justify-center ring-2 ring-white shadow-sm"
      style={{ width: AVATAR_PX, height: AVATAR_PX }}
    >
      {reviewerInitials(name)}
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: IReviewMeta; index: number }) => {
  const { t } = useTranslation('home');
  const name = t(`reviews.items.${review.key}.name`);
  const date = t(`reviews.items.${review.key}.date`);
  const text = t(`reviews.items.${review.key}.text`);
  const ratingLabel = t('reviews.ratingLabel', { rating: review.rating });

  return (
    <Reveal delay={index * TIMING.packageStaggerMs}>
      <figure className="relative h-full bg-white border border-stone-200/80 px-7 pt-7 pb-7 flex flex-col">
        <FormatQuote
          aria-hidden
          className="text-brand-gold/30 -ml-1 mb-1"
          style={{ fontSize: 44, transform: 'scaleX(-1)' }}
        />
        <StarRow rating={review.rating} label={ratingLabel} />
        <blockquote className="mt-5 text-stone-700 leading-relaxed flex-1">{text}</blockquote>
        <figcaption className="mt-6 pt-5 border-t border-stone-200/80 flex items-center gap-3">
          <Avatar src={REVIEW_AVATARS[review.key]} name={name} />
          <div className="min-w-0">
            <div className="font-medium text-stone-900 truncate">{name}</div>
            <div className="mt-0.5 text-sm text-stone-500">{date}</div>
          </div>
        </figcaption>
      </figure>
    </Reveal>
  );
};

export const Reviews = () => {
  const { t } = useTranslation('home');

  return (
    <section aria-labelledby="reviews-heading" className="py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4">
        <Reveal variant="fade">
          <div className="text-center mb-14">
            <span className="eyebrow text-brand-gold-ink">{t('reviews.eyebrow')}</span>
            <h2
              id="reviews-heading"
              className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
            >
              {t('reviews.heading')}
            </h2>
            <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
            <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {t('reviews.subheading')}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review, index) => (
            <ReviewCard key={review.key} review={review} index={index} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-brand-green-ink hover:text-brand-green-deep transition-colors"
          >
            {t('reviews.viewAllOnGoogle')} →
          </a>
        </div>
      </div>
    </section>
  );
};
