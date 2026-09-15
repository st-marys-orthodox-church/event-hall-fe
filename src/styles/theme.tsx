import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5e7768',
      light: '#7c9885',
      dark: '#5a7263',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c9a86c',
      light: '#d4b87a',
      dark: '#b8975f',
      contrastText: '#1f2a23',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
