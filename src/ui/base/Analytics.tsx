import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID, isAnalyticsEnabled, trackPageView } from '../../utils/Analytics';

/**
 * Loads GA4 after hydration and reports client-side route changes. Renders
 * nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset, so local dev and
 * preview builds stay untracked.
 */
export const Analytics = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    router.events.on('routeChangeComplete', trackPageView);
    return () => router.events.off('routeChangeComplete', trackPageView);
  }, [router.events]);

  if (!isAnalyticsEnabled()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
};
