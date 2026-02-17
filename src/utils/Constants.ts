import { BulletList } from '../ui/features/BulletList';
import { ReactNode } from 'react';

// Define type locally to avoid circular dependency
type ICardGridListItemProps = {
  title: string;
  img?: `${string}`;
  price?: string;
  description?: string | ReactNode;
  cta?: {
    action?: any;
    text: string;
    link?: string;
  };
};

export const SOCIALS = {
  FB: 'https://www.facebook.com/bisericasfantamariadacula',
  IG: 'https://www.instagram.com/fellowshipstmary/',
};

// WhatsApp Business Configuration
// TODO: Replace with actual business number when provided by Zero
// Format: country code + phone number without spaces or special characters (e.g., 14165551234 for US)
export const WHATSAPP_CONFIG = {
  phoneNumber: '1234567890', // Placeholder - replace with actual number
  defaultMessage: "Hi St. Mary's! I'm interested in booking your event hall.",
};

// Event types for package-specific quick quotes
export const EVENT_TYPES = {
  WEDDING: 'Wedding',
  CORPORATE: 'Corporate Event',
  BIRTHDAY: 'Birthday Party',
  OTHER: 'Other Event',
} as const;

// Helper to generate WhatsApp click-to-chat URL
export const generateWhatsAppUrl = (options?: {
  eventType?: string;
  date?: string;
  guests?: string;
}): string => {
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

export const PACKAGES_LIST: ICardGridListItemProps[] = [
  {
    title: '50 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $2000',
    img: 'https://i.imgur.com/7r6dEdZ.jpg',
    cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '150 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $3000',
    img: '/photos/tier-3.jpg',
    cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '250 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $4000',
    img: '/photos/tier-2.jpeg',
    cta: { text: 'Learn More', link: '/packages' },
  },
];
