export const SOCIALS = {
  FB: 'https://www.facebook.com/fellowshipvenue',
  IG: 'https://www.instagram.com/fellowshipeventhall/',
};

// WhatsApp Business Configuration - uses environment variable for security
// Format: country code + phone number without spaces or special characters (e.g., 14165551234 for US)
export const WHATSAPP_CONFIG = {
  phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '',
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
