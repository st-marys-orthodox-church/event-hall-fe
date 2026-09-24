import { CacheProvider, type EmotionCache } from '@emotion/react';
import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
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

// AppCacheProvider from @mui/material-nextjs is ESM-only, so Turbopack bundles
// it with its own copy of @emotion/react while @mui/material is externalized and
// uses Node's copy. The two copies have different contexts, so on the dev server
// MUI never saw the cache and hydration failed with `css-` vs `mui-` classes.
// Wrapping with @emotion/react's CacheProvider directly keeps one instance.
const clientEmotionCache = createEmotionCache();

type Props = AppProps & { emotionCache?: EmotionCache };

const MyApp = ({ Component, pageProps, emotionCache = clientEmotionCache }: Props) => {
  const AnyComponent = Component as any;
  return (
    <CacheProvider value={emotionCache}>
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
    </CacheProvider>
  );
};

export default appWithTranslation(MyApp) as ComponentType<AppProps>;
