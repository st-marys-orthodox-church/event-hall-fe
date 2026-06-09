export const SOCIALS = {
  FB: 'https://www.facebook.com/fellowshipvenue',
  IG: 'https://www.instagram.com/fellowshipeventhall/',
};

// Single source of truth for the venue phone number, served via NEXT_PUBLIC_PHONE so it can be
// overridden per environment without a code change. Falls back to the production number so the
// tel: link, displayed number, and WhatsApp deep link never break when the env var is unset.
export const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE || '+1-404-518-1042';

// WhatsApp deep links need digits only — country code + number, no '+' or punctuation.
export const WHATSAPP_CONFIG = {
  phoneNumber: PHONE_NUMBER.replace(/\D/g, ''),
  defaultMessage: "Hi St. Mary's! I'm interested in booking your event hall.",
};

// Event types are identifiers used to build English WhatsApp messages;
// button labels shown to users are translated separately via i18n.
export const EVENT_TYPES = {
  WEDDING: 'Wedding',
  QUINCEANERA: 'Quinceañera',
  CORPORATE: 'Corporate Event',
  BIRTHDAY: 'Birthday Party',
  OTHER: 'Other Event',
} as const;

export type IWhatsAppUrlOptions = {
  eventType?: string;
  date?: string;
  guests?: string;
};

// WhatsApp messages always go out in English — the recipient is the church office.
export const generateWhatsAppUrl = (options?: IWhatsAppUrlOptions): string => {
  const { eventType, date, guests } = options || {};

  let message = WHATSAPP_CONFIG.defaultMessage;

  if (eventType) {
    message += ` I'm planning a ${eventType}.`;
  }

  if (date) {
    message += ` My event date is ${date}.`;
  }

  if (guests) {
    message += ` I expect about ${guests} guests.`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMessage}`;
};
