import { OpenInNew, Place, Schedule } from '@mui/icons-material';
import { useTranslation } from 'next-i18next/pages';
import Link from 'next/link';
import { type DisplayEvent, eventAnchorHref } from '../../utils/Events';

type Props = {
  events: DisplayEvent[];
  /** `compact` is the home teaser; `full` is the /events listing with descriptions. */
  variant?: 'compact' | 'full';
};

const EventCard = ({ event, variant }: { event: DisplayEvent; variant: 'compact' | 'full' }) => {
  const { t } = useTranslation('events');
  const compact = variant === 'compact';

  return (
    <article
      id={compact ? undefined : event.id}
      className="relative h-full bg-white border border-stone-200/80 flex flex-col scroll-mt-28 shadow-soft"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      <div className="flex items-start gap-5 p-6 sm:p-7">
        <div
          aria-hidden
          className="flex-shrink-0 w-16 flex flex-col items-center justify-center border border-brand-gold/40 bg-brand-gold/10 py-2"
        >
          <span className="eyebrow text-brand-gold-ink text-[0.625rem]">{event.badgeMonth}</span>
          <span className="font-display text-3xl leading-none text-stone-900 mt-1">
            {event.badgeDay}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="eyebrow text-brand-green-ink text-[0.625rem]">
            {t('list.openInvite')}
          </span>
          <h3 className="mt-1.5 font-display text-2xl text-stone-900 leading-tight">
            {compact ? (
              <Link
                href={eventAnchorHref(event)}
                className="hover:text-brand-green-deep transition-colors"
              >
                {event.title}
              </Link>
            ) : (
              event.title
            )}
          </h3>
          <dl className="mt-3 space-y-1.5 text-sm text-stone-600">
            <div className="flex items-start gap-2">
              <dt className="sr-only">{t('list.whenLabel')}</dt>
              <Schedule aria-hidden fontSize="small" className="text-brand-gold mt-px" />
              <dd>
                {event.when}
                {event.allDay ? ` · ${t('list.allDay')}` : ''}
              </dd>
            </div>
            {event.location && (
              <div className="flex items-start gap-2">
                <dt className="sr-only">{t('list.whereLabel')}</dt>
                <Place aria-hidden fontSize="small" className="text-brand-green mt-px" />
                <dd>{event.location}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      {!compact && event.description && (
        <p className="px-6 sm:px-7 pb-6 text-stone-700 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      )}
      {!compact && event.url && (
        <div className="mt-auto px-6 sm:px-7 pb-6">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('list.detailsAria', { title: event.title })}
            className="eyebrow text-brand-green-ink hover:text-brand-green-deep transition-colors inline-flex items-center gap-1.5"
          >
            {t('list.details')}
            <OpenInNew aria-hidden style={{ fontSize: 14 }} />
          </a>
        </div>
      )}
    </article>
  );
};

const UpcomingEvents = ({ events, variant = 'full' }: Props) => {
  const { t } = useTranslation('events');

  if (events.length === 0) {
    return (
      <div className="bg-white border border-stone-200/80 p-10 text-center">
        <p className="font-display text-2xl text-stone-900">{t('empty.title')}</p>
        <p className="mt-3 text-stone-600">{t('empty.body')}</p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'compact'
          ? 'grid grid-cols-1 md:grid-cols-3 gap-6'
          : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
      }
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} variant={variant} />
      ))}
    </div>
  );
};

export { UpcomingEvents };
