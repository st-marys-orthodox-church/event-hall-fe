import { appWithTranslation } from 'next-i18next/pages';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { AppWrapper } from '../stores/Global';
import { display, sans } from '../styles/fonts';
import { MuiThemeProvider } from '../styles/theme';
import { Analytics } from '../ui/base/Analytics';
import { ContactModalHost } from '../ui/modals/ContactModalHost';
import { ViewingModalHost } from '../ui/modals/ViewingModalHost';

import '../styles/global.css';

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === '1';
const ChatWidget = dynamic(() => import('../ui/features/ChatWidget').then((m) => m.ChatWidget), {
  ssr: false,
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <MuiThemeProvider>
      <AppWrapper>
        <div className={`${sans.variable} ${display.variable}`}>
          <AnyComponent {...pageProps} />
          <ContactModalHost />
          <ViewingModalHost />
          {CHAT_ENABLED && <ChatWidget />}
          <Analytics />
        </div>
      </AppWrapper>
    </MuiThemeProvider>
  );
};

export default appWithTranslation(MyApp) as ComponentType<AppProps>;
