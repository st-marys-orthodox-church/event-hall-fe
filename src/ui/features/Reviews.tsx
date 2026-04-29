import { FormatQuote, Star } from '@mui/icons-material';
import { useTranslation } from 'next-i18next/pages';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { TIMING } from '../../utils/DesignTokens';
import { GOOGLE_REVIEWS_URL, type IReviewMeta, REVIEWS } from '../../utils/Reviews';

const StarRow = ({ rating, label }: { rating: number; label: string }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={label}>
    {Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="text-brand-gold" fontSize="small" aria-hidden />
    ))}
  </div>
);

const ReviewCard = ({ review, index }: { review: IReviewMeta; index: number }) => {
  const { t } = useTranslation('home');
  const name = t(`reviews.items.${review.key}.name`);
  const date = t(`reviews.items.${review.key}.date`);
  const text = t(`reviews.items.${review.key}.text`);
  const ratingLabel = t('reviews.ratingLabel', { rating: review.rating });

  return (
    <AnimationOnScroll
      animateIn="animate__fadeInUp"
      delay={index * TIMING.packageStaggerMs}
      animateOnce
    >
      <figure className="relative h-full bg-white border border-stone-200/80 px-7 pt-7 pb-7 flex flex-col">
        <FormatQuote
          aria-hidden
          className="text-brand-gold/30 -ml-1 mb-1"
          style={{ fontSize: 44, transform: 'scaleX(-1)' }}
        />
        <StarRow rating={review.rating} label={ratingLabel} />
        <blockquote className="mt-5 text-stone-700 leading-relaxed flex-1">{text}</blockquote>
        <figcaption className="mt-6 pt-5 border-t border-stone-200/80">
          <div className="font-medium text-stone-900">{name}</div>
          <div className="mt-1 text-sm text-stone-500">{date}</div>
        </figcaption>
      </figure>
    </AnimationOnScroll>
  );
};

export const Reviews = () => {
  const { t } = useTranslation('home');

  return (
    <section aria-labelledby="reviews-heading" className="py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4">
        <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
          <div className="text-center mb-14">
            <span className="eyebrow text-brand-gold">{t('reviews.eyebrow')}</span>
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
        </AnimationOnScroll>

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
            className="eyebrow text-brand-green hover:text-brand-green-dark transition-colors"
          >
            {t('reviews.viewAllOnGoogle')} →
          </a>
        </div>
      </div>
    </section>
  );
};
