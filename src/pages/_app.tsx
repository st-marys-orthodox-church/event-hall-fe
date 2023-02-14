import { AppProps } from 'next/app';
import { AppWrapper } from '../stores/Global';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import '../styles/global.css';
import { ContactModal } from '../ui/modals/Contact';
import { LocalizationProvider } from '@mui/x-date-pickers';
import "animate.css/animate.min.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const AnyComponent = Component as any;
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <AppWrapper>
        <AnyComponent {...pageProps} />
        <ContactModal />
      </AppWrapper>
    </LocalizationProvider>
  );
};

export default MyApp;
