type GtagParams = Record<string, string | number | boolean | undefined>;
type Gtag = (
  command: 'config' | 'event' | 'js',
  target: string | Date,
  params?: GtagParams
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

/** GA4 measurement id (G-XXXXXXXXXX). Unset means analytics is off everywhere. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export const isAnalyticsEnabled = () => GA_MEASUREMENT_ID.length > 0;

export const trackEvent = (name: string, params?: GtagParams) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
};

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
};
