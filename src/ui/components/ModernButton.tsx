import { type ButtonProps, Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'outlineLight' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'buttonVariant' && prop !== 'size',
})<ModernButtonProps>(({ buttonVariant = 'primary', size = 'medium' }) => ({
  borderRadius: '10px',
  textTransform: 'none' as const,
  fontWeight: 600,
  letterSpacing: '0.02em',
  transition: 'all 0.25s ease-out',
  position: 'relative',
  overflow: 'hidden',
  willChange: 'transform, box-shadow',
  boxSizing: 'border-box',

  ...(size === 'small' && {
    padding: '8px 16px',
    fontSize: '0.875rem',
  }),
  ...(size === 'medium' && {
    padding: '10px 20px',
    fontSize: '0.9375rem',
  }),
  ...(size === 'large' && {
    padding: '10px 26px',
    fontSize: '1rem',
  }),

  ...(buttonVariant === 'primary' && {
    background: 'linear-gradient(135deg, #7c9885 0%, #9db5a0 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(124, 152, 133, 0.35)',
    '&:hover': {
      background: 'linear-gradient(135deg, #6b8574 0%, #8ca58f 100%)',
      boxShadow: '0 4px 12px rgba(124, 152, 133, 0.45)',
    },
    '&:active': {
      boxShadow: '0 1px 4px rgba(124, 152, 133, 0.35)',
    },
  }),

  ...(buttonVariant === 'secondary' && {
    background: 'linear-gradient(135deg, #c9a86c 0%, #d4b87a 100%)',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(201, 168, 108, 0.35)',
    '&:hover': {
      background: 'linear-gradient(135deg, #b8975f 0%, #c9a86c 100%)',
      boxShadow: '0 4px 12px rgba(201, 168, 108, 0.45)',
    },
    '&:active': {
      boxShadow: '0 1px 4px rgba(201, 168, 108, 0.35)',
    },
  }),

  ...(buttonVariant === 'outline' && {
    background: 'transparent',
    color: '#7c9885',
    border: '2px solid #7c9885',
    ...(size === 'small' && { padding: '6px 16px' }),
    ...(size === 'medium' && { padding: '8px 20px' }),
    ...(size === 'large' && { padding: '8px 26px' }),
    '&:hover': {
      background: 'rgba(124, 152, 133, 0.1)',
      borderColor: '#6b8574',
    },
    '&:active': {
      background: 'rgba(124, 152, 133, 0.15)',
    },
  }),

  ...(buttonVariant === 'outlineLight' && {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(4px)',
    ...(size === 'small' && { padding: '6px 16px' }),
    ...(size === 'medium' && { padding: '8px 20px' }),
    ...(size === 'large' && { padding: '8px 26px' }),
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderColor: '#ffffff',
    },
    '&:active': {
      background: 'rgba(255, 255, 255, 0.25)',
    },
  }),

  ...(buttonVariant === 'ghost' && {
    background: 'transparent',
    color: '#7c9885',
    '&:hover': {
      background: 'rgba(124, 152, 133, 0.1)',
    },
    '&:active': {
      background: 'rgba(124, 152, 133, 0.15)',
    },
  }),
}));

export const ModernButton = ({ children, ...props }: ModernButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};
