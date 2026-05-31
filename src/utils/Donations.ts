export const DONATION_PRESET_AMOUNTS = [10, 20, 50, 100, 500] as const;

export const PAYPAL_DONATE_ENDPOINT = 'https://www.paypal.com/donate';

export const PAYPAL_DONATION_DEFAULTS = {
  business: process.env.NEXT_PUBLIC_PAYPAL_DONATE_BUSINESS || 'church@saintmaryro.org',
  buttonText: process.env.NEXT_PUBLIC_PAYPAL_DONATE_CBT || 'Biserica Ortodoxa Romana Sfanta Maria',
  campaign: process.env.NEXT_PUBLIC_PAYPAL_DONATE_ITEM_NAME || 'Donatii Sala Sociala a Bisericii',
  currency: process.env.NEXT_PUBLIC_PAYPAL_DONATE_CURRENCY || 'USD',
} as const;

export type DonateFormValues = {
  amount: string;
  anonymous: boolean;
  comment: string;
  email: string;
  firstName: string;
  lastName: string;
};

const buildCustomField = (values: DonateFormValues) => {
  const tokens = [
    values.anonymous ? 'anonymous=1' : 'anonymous=0',
    values.comment ? `comment=${values.comment.trim().replace(/\s+/g, ' ').slice(0, 120)}` : '',
  ].filter(Boolean);

  return tokens.join('|');
};

export const createDonationInvoiceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`.slice(0, 32);
};

export const buildPayPalDonateUrl = (values: DonateFormValues, siteOrigin: string) => {
  const params = new URLSearchParams();
  const normalizedAmount = Number.parseFloat(values.amount).toFixed(2);

  params.set('business', PAYPAL_DONATION_DEFAULTS.business);
  params.set('cmd', '_donations');
  params.set('currency_code', PAYPAL_DONATION_DEFAULTS.currency);
  params.set('item_name', `${PAYPAL_DONATION_DEFAULTS.campaign}: $${normalizedAmount}`);
  params.set('amount', normalizedAmount);
  params.set('first_name', values.firstName.trim());
  params.set('last_name', values.lastName.trim());
  params.set('email', values.email.trim());
  params.set('invoice', createDonationInvoiceId());
  params.set('return', `${siteOrigin}/donate?status=returned`);
  params.set('cancel_return', `${siteOrigin}/donate?status=cancelled`);
  params.set('no_shipping', '1');
  params.set('no_note', values.comment.trim() ? '0' : '1');
  params.set('charset', 'UTF-8');
  params.set('rm', '2');
  params.set('cbt', PAYPAL_DONATION_DEFAULTS.buttonText);

  const customField = buildCustomField(values);
  if (customField) {
    params.set('custom', customField);
  }

  return `${PAYPAL_DONATE_ENDPOINT}/?${params.toString()}`;
};

export const formatDonationAmount = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    currency: PAYPAL_DONATION_DEFAULTS.currency,
    style: 'currency',
  }).format(amount);
