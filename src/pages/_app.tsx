import { appWithTranslation } from 'next-i18next/pages';
import type { AppProps } from 'next/app';
import type { ComponentType } from 'react';
import { AppWrapper } from '../stores/Global';
import { display, sans } from '../styles/fonts';
import { MuiThemeProvider } from '../styles/theme';
import { Analytics } from '../ui/base/Analytics';
import { ContactModalHost } from '../ui/modals/ContactModalHost';

import '../styles/global.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <MuiThemeProvider>
      <AppWrapper>
        <div className={`${sans.variable} ${display.variable}`}>
          <AnyComponent {...pageProps} />
          <ContactModalHost />
          <Analytics />
        </div>
      </AppWrapper>
    </MuiThemeProvider>
  );
};

export default appWithTranslation(MyApp) as ComponentType<AppProps>;
