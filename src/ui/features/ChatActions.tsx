import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import type { ChatAction } from '../../server/chatAgent';
import { useAppContext } from '../../stores/Global';
import { trackEvent } from '../../utils/Analytics';
import { PHONE_NUMBER, generateWhatsAppUrl } from '../../utils/Constants';
import { VENUE_TIMEZONE } from '../../utils/Events';
import type { ViewingPrefill } from '../../utils/Viewings';

export type ContactOptions = Omit<Extract<ChatAction, { action: 'contact' }>, 'action'>;

export type ChatActionsProps = {
  viewingPrefill?: ViewingPrefill;
  contact?: ContactOptions;
  booked?: { start: string; email: string };
  /** Prefix of the analytics events, so a call's taps are told apart from the chat's. */
  channel?: 'chat' | 'voice';
};

/** What the agent puts on screen under a reply: the booking button, the booked card, contacts. */
export const ChatActions = ({
  viewingPrefill,
  contact,
  booked,
  channel = 'chat',
}: ChatActionsProps) => {
  const { t } = useTranslation('chat');
  const { t: tViewing } = useTranslation('viewing');
  const { locale = 'en' } = useRouter();
  const { handleOpenViewing, handleOpenModal } = useAppContext();

  const formatWhen = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: VENUE_TIMEZONE,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));

  return (
    <>
      {viewingPrefill && (
        <button
          type="button"
          onClick={() => handleOpenViewing(viewingPrefill)}
          className="mt-2 bg-brand-gold px-4 py-3 text-xs font-medium uppercase sm:px-3 sm:py-2 tracking-[0.14em] text-brand-dark transition-colors hover:bg-brand-gold-dark"
        >
          {tViewing('cta.button')}
        </button>
      )}
      {booked && (
        <div className="mt-2 border-l-2 border-brand-green bg-primary-100 px-3 py-2">
          <p className="flex items-center gap-1.5 font-medium text-brand-green-ink">
            <CheckCircleOutline fontSize="small" />
            {t('booked.heading')}
          </p>
          <p className="mt-1 text-sm text-stone-700 sm:text-xs">
            {t('booked.body', { when: formatWhen(booked.start), email: booked.email })}
          </p>
        </div>
      )}
      {contact && (
        <div className="mt-2 flex flex-wrap gap-2">
          {contact.channels.includes('call') && (
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^\d+]/g, '')}`}
              onClick={() => trackEvent(`${channel}_call_click`, { event_category: 'engagement' })}
              className="flex items-center gap-1.5 bg-brand-green-deep px-4 py-3 text-sm sm:px-3 sm:py-2 sm:text-xs font-medium text-white no-underline transition-colors hover:bg-brand-green-ink"
            >
              <PhoneIcon sx={{ fontSize: 16 }} />
              {t('call')}
            </a>
          )}
          {contact.channels.includes('whatsapp') && (
            <a
              href={generateWhatsAppUrl(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent(`${channel}_whatsapp_click`, { event_category: 'engagement' })
              }
              className="flex items-center gap-1.5 bg-whatsapp px-4 py-3 text-sm sm:px-3 sm:py-2 sm:text-xs font-medium text-brand-dark no-underline transition-colors hover:bg-whatsapp-ink hover:text-white"
            >
              <WhatsAppIcon sx={{ fontSize: 16 }} />
              {t('whatsapp')}
            </a>
          )}
          {contact.channels.includes('form') && (
            <button
              type="button"
              onClick={() => {
                trackEvent(`${channel}_contact_form_click`, { event_category: 'engagement' });
                handleOpenModal();
              }}
              className="border border-brand-gold px-4 py-3 text-sm font-medium text-brand-gold-ink sm:px-3 sm:py-2 sm:text-xs transition-colors hover:bg-brand-gold hover:text-brand-dark"
            >
              {t('contactForm')}
            </button>
          )}
        </div>
      )}
    </>
  );
};
