import { AppProps } from 'next/app';
import { AppWrapper } from '../stores/Global';

import '../styles/global.css';
import { ContactModal } from '../ui/modals/Contact';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <AppWrapper>
      <AnyComponent {...pageProps} />
      <ContactModal />
    </AppWrapper>
  )
};

export default MyApp;
