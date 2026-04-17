import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, type ButtonProps } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import type React from 'react';
import { generateWhatsAppUrl } from '../../utils/Constants';
import { COLORS } from '../../utils/DesignTokens';

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
  const { t } = useTranslation('common');
  const handleClick = () => {
    if (onAnalyticsTrack) {
      onAnalyticsTrack(eventType);
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: eventType || 'general',
      });
    }
  };

  const whatsappUrl = generateWhatsAppUrl({ eventType, date, guests });

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
          backgroundColor: variant === 'contained' ? COLORS.whatsapp.base : 'transparent',
          color: variant === 'contained' ? 'white' : COLORS.whatsapp.base,
          borderColor: variant === 'outlined' ? COLORS.whatsapp.base : undefined,
          '&:hover': {
            backgroundColor:
              variant === 'contained' ? COLORS.whatsapp.dark : 'rgba(37, 211, 102, 0.1)',
            borderColor: variant === 'outlined' ? COLORS.whatsapp.dark : undefined,
          },
          textTransform: 'none',
          fontWeight: 600,
          ...buttonProps.sx,
        }}
        startIcon={showIcon ? <WhatsAppIcon /> : undefined}
        {...buttonProps}
      >
        {children || `💬 ${t('whatsapp.default')}`}
      </Button>
    </a>
  );
};

export default WhatsAppButton;
