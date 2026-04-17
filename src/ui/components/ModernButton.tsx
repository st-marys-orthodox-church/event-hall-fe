import { type ButtonProps, Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'outlineLight' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

const REFINED = 'cubic-bezier(0.22, 1, 0.36, 1)';

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'buttonVariant' && prop !== 'size',
})<ModernButtonProps>(({ buttonVariant = 'primary', size = 'medium' }) => ({
  borderRadius: '2px',
  textTransform: 'uppercase' as const,
  fontWeight: 500,
  letterSpacing: '0.14em',
  transition: `all 0.35s ${REFINED}`,
  position: 'relative',
  overflow: 'hidden',
  willChange: 'transform, box-shadow',
  boxSizing: 'border-box',

  ...(size === 'small' && {
    padding: '9px 18px',
    fontSize: '0.75rem',
  }),
  ...(size === 'medium' && {
    padding: '11px 24px',
    fontSize: '0.8125rem',
  }),
  ...(size === 'large' && {
    padding: '14px 32px',
    fontSize: '0.875rem',
  }),

  ...(buttonVariant === 'primary' && {
    background: '#7c9885',
    color: '#ffffff',
    boxShadow: '0 10px 24px -14px rgba(15, 23, 23, 0.45)',
    '&:hover': {
      background: '#6b8574',
      boxShadow: '0 14px 30px -14px rgba(15, 23, 23, 0.55)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 6px 18px -14px rgba(15, 23, 23, 0.45)',
    },
  }),

  ...(buttonVariant === 'secondary' && {
    background: '#c9a86c',
    color: '#ffffff',
    boxShadow: '0 10px 24px -14px rgba(15, 23, 23, 0.45)',
    '&:hover': {
      background: '#b8975f',
      boxShadow: '0 14px 30px -14px rgba(15, 23, 23, 0.55)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 6px 18px -14px rgba(15, 23, 23, 0.45)',
    },
  }),

  ...(buttonVariant === 'outline' && {
    background: 'transparent',
    color: '#3a4c41',
    border: '1px solid #7c9885',
    ...(size === 'small' && { padding: '8px 18px' }),
    ...(size === 'medium' && { padding: '10px 24px' }),
    ...(size === 'large' && { padding: '13px 32px' }),
    '&:hover': {
      background: '#7c9885',
      borderColor: '#7c9885',
      color: '#ffffff',
    },
    '&:active': {
      background: '#6b8574',
      borderColor: '#6b8574',
    },
  }),

  ...(buttonVariant === 'outlineLight' && {
    background: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.75)',
    ...(size === 'small' && { padding: '8px 18px' }),
    ...(size === 'medium' && { padding: '10px 24px' }),
    ...(size === 'large' && { padding: '13px 32px' }),
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ffffff',
      color: '#1f2a23',
    },
    '&:active': {
      background: 'rgba(255, 255, 255, 0.9)',
    },
  }),

  ...(buttonVariant === 'ghost' && {
    background: 'transparent',
    color: '#7c9885',
    '&:hover': {
      background: 'rgba(124, 152, 133, 0.08)',
    },
    '&:active': {
      background: 'rgba(124, 152, 133, 0.14)',
    },
  }),
}));

export const ModernButton = ({ children, ...props }: ModernButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};
