import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { appWithTranslation } from 'next-i18next/pages';
import type { AppProps } from 'next/app';
import type { ComponentType } from 'react';
import { AppWrapper } from '../stores/Global';
import { display, sans } from '../styles/fonts';
import { MuiThemeProvider } from '../styles/theme';
import { ContactModal } from '../ui/modals/Contact';

import '../styles/global.css';
import 'animate.css/animate.min.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <MuiThemeProvider>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <AppWrapper>
          <div className={`${sans.variable} ${display.variable}`}>
            <AnyComponent {...pageProps} />
            <ContactModal />
          </div>
        </AppWrapper>
      </LocalizationProvider>
    </MuiThemeProvider>
  );
};

export default appWithTranslation(MyApp) as ComponentType<AppProps>;
