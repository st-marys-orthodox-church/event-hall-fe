import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, type ButtonProps } from '@mui/material';
import type React from 'react';

// WhatsApp Business Configuration - uses environment variable for security
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '';

// Helper to generate WhatsApp click-to-chat URL
const generateWhatsAppUrl = (options?: {
  eventType?: string;
  date?: string;
  guests?: string;
}): string => {
  const { eventType, date, guests } = options || {};

  let message = "Hi St. Mary's! I'm interested in booking your event hall.";

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
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
};

interface WhatsAppButtonProps extends Omit<ButtonProps, 'href'> {
  eventType?: string;
  date?: string;
  guests?: string;
  showIcon?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  onAnalyticsTrack?: (eventType?: string) => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  eventType,
  date,
  guests,
  showIcon = true,
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  className = '',
  onAnalyticsTrack,
  children,
  ...buttonProps
}) => {
  const handleClick = () => {
    // Track click if analytics callback provided
    if (onAnalyticsTrack) {
      onAnalyticsTrack(eventType);
    }
    // Optional: Add gtag or other analytics here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: eventType || 'general',
      });
    }
  };

  const whatsappUrl = generateWhatsAppUrl({ eventType, date, guests });

  // WhatsApp brand color
  const whatsappGreen = '#25D366';
  const whatsappDarkGreen = '#128C7E';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="no-underline"
      style={{ display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : 'auto' }}
    >
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={`${className}`}
        sx={{
          backgroundColor: variant === 'contained' ? whatsappGreen : 'transparent',
          color: variant === 'contained' ? 'white' : whatsappGreen,
          borderColor: variant === 'outlined' ? whatsappGreen : undefined,
          '&:hover': {
            backgroundColor:
              variant === 'contained' ? whatsappDarkGreen : 'rgba(37, 211, 102, 0.1)',
            borderColor: variant === 'outlined' ? whatsappDarkGreen : undefined,
          },
          textTransform: 'none',
          fontWeight: 600,
          ...buttonProps.sx,
        }}
        startIcon={showIcon ? <WhatsAppIcon /> : undefined}
        {...buttonProps}
      >
        {children || '💬 Chat on WhatsApp'}
      </Button>
    </a>
  );
};

export default WhatsAppButton;
