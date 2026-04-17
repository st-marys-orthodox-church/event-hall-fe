import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import type { AppProps } from 'next/app';
import { AppWrapper } from '../stores/Global';

import '../styles/global.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ContactModal } from '../ui/modals/Contact';
import 'animate.css/animate.min.css';
import { MuiThemeProvider } from '../styles/theme';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <MuiThemeProvider>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <AppWrapper>
          <AnyComponent {...pageProps} />
          <ContactModal />
        </AppWrapper>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
};

export default MyApp;
