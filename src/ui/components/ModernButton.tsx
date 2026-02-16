import { Button as MuiButton, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactNode } from 'react';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'buttonVariant' && prop !== 'size',
})<ModernButtonProps>(({ buttonVariant = 'primary', size = 'medium' }) => ({
  borderRadius: '12px',
  textTransform: 'none' as const,
  fontWeight: 600,
  letterSpacing: '0.025em',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  ...(size === 'small' && {
    padding: '10px 20px',
    fontSize: '0.875rem',
  }),
  ...(size === 'medium' && {
    padding: '14px 28px',
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    padding: '18px 36px',
    fontSize: '1.125rem',
  }),

  ...(buttonVariant === 'primary' && {
    background: 'linear-gradient(135deg, #7c9885 0%, #9db5a0 50%, #7c9885 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(124, 152, 133, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #6b8574 0%, #8ca58f 50%, #6b8574 100%)',
      boxShadow: '0 6px 20px rgba(124, 152, 133, 0.5)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(124, 152, 133, 0.4)',
    },
  }),

  ...(buttonVariant === 'secondary' && {
    background: 'linear-gradient(135deg, #c9a86c 0%, #d4b87a 50%, #c9a86c 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 14px rgba(201, 168, 108, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #b8975f 0%, #c9a86c 50%, #b8975f 100%)',
      boxShadow: '0 6px 20px rgba(201, 168, 108, 0.5)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(201, 168, 108, 0.4)',
    },
  }),

  ...(buttonVariant === 'outline' && {
    background: 'transparent',
    color: '#7c9885',
    border: '2px solid #7c9885',
    '&:hover': {
      background: 'rgba(124, 152, 133, 0.08)',
      borderColor: '#6b8574',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),

  ...(buttonVariant === 'ghost' && {
    background: 'transparent',
    color: '#7c9885',
    '&:hover': {
      background: 'rgba(124, 152, 133, 0.08)',
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },

  '&:hover::before': {
    left: '100%',
  },
}));

export const ModernButton = ({ children, ...props }: ModernButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};