import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useRouter } from 'next/router';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import {
  DONATION_PRESET_AMOUNTS,
  type DonateFormValues,
  PAYPAL_DONATION_DEFAULTS,
  buildPayPalDonateUrl,
  formatDonationAmount,
} from '../utils/Donations';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const DEFAULT_AMOUNT = '10.00';

const statusStyles = {
  cancelled: 'border-rose-200 bg-rose-50 text-rose-900',
  returned: 'border-emerald-200 bg-emerald-50 text-emerald-950',
} as const;

const DonatePage = () => {
  const { t } = useTranslation('donate');
  const router = useRouter();
  const status = typeof router.query.status === 'string' ? router.query.status : null;
  const [values, setValues] = useState<DonateFormValues>({
    amount: DEFAULT_AMOUNT,
    anonymous: false,
    comment: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const amountNumber = Number.parseFloat(values.amount);
  const amountIsValid = Number.isFinite(amountNumber) && amountNumber > 0;

  const handleChange =
    (field: keyof Omit<DonateFormValues, 'anonymous'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handlePreset = (amount: number) => {
    setValues((current) => ({ ...current, amount: amount.toFixed(2) }));
  };

  const handleAnonymousChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, anonymous: event.target.checked }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amountIsValid || typeof window === 'undefined') {
      return;
    }

    const donateUrl = buildPayPalDonateUrl(values, window.location.origin);
    window.location.assign(donateUrl);
  };

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={t('seoTitle')} description={t('seoDescription')} />

      <Template topPad>
        <section className="relative overflow-hidden py-20 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,108,0.1),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(124,152,133,0.08),_transparent_24%)]" />

          <div className="relative mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <span className="eyebrow text-brand-gold">{t('eyebrow')}</span>
              <h1 className="mt-4 text-4xl text-stone-900 md:text-6xl">{t('title')}</h1>
              <div className="mt-5 h-px w-16 bg-brand-gold" />
              <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-600">{t('intro')}</p>
            </div>

            {status === 'returned' || status === 'cancelled' ? (
              <div
                className={`mt-10 max-w-3xl rounded-sm border px-5 py-4 ${statusStyles[status]}`}
              >
                <p className="font-medium">
                  {status === 'returned' ? t('status.returnedTitle') : t('status.cancelledTitle')}
                </p>
                <p className="mt-2 text-sm leading-6">
                  {status === 'returned' ? t('status.returnedBody') : t('status.cancelledBody')}
                </p>
              </div>
            ) : null}

            <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-[0_28px_70px_-46px_rgba(28,25,23,0.35)]"
              >
                <div className="border-b border-stone-200 px-6 py-8 md:px-8">
                  <label className="block">
                    <span className="eyebrow text-brand-gold">{t('amount.label')}</span>
                    <div className="mt-4 flex max-w-[240px] overflow-hidden rounded-sm border border-stone-300">
                      <span className="flex items-center border-r border-stone-300 bg-stone-50 px-5 text-2xl text-stone-700">
                        $
                      </span>
                      <input
                        inputMode="decimal"
                        name="amount"
                        value={values.amount}
                        onChange={handleChange('amount')}
                        className="w-full px-5 py-4 text-2xl text-stone-900 outline-none"
                        aria-label={t('amount.label')}
                      />
                    </div>
                  </label>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {DONATION_PRESET_AMOUNTS.map((amount) => {
                      const isActive = values.amount === amount.toFixed(2);
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handlePreset(amount)}
                          className={`min-w-[86px] rounded-sm border px-4 py-3 text-base transition-colors ${
                            isActive
                              ? 'border-brand-green bg-brand-green text-white'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-brand-green hover:text-brand-green'
                          }`}
                        >
                          ${amount}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setValues((current) => ({ ...current, amount: '' }))}
                      className="rounded-sm border border-stone-300 px-4 py-3 text-base text-stone-700 transition-colors hover:border-brand-green hover:text-brand-green"
                    >
                      {t('amount.custom')}
                    </button>
                  </div>
                </div>

                <div className="px-6 py-8 md:px-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">
                        {t('fields.firstName')}
                      </span>
                      <input
                        required
                        value={values.firstName}
                        onChange={handleChange('firstName')}
                        className="w-full rounded-sm border border-stone-300 px-4 py-3 text-base outline-none transition-colors focus:border-brand-green"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">
                        {t('fields.lastName')}
                      </span>
                      <input
                        required
                        value={values.lastName}
                        onChange={handleChange('lastName')}
                        className="w-full rounded-sm border border-stone-300 px-4 py-3 text-base outline-none transition-colors focus:border-brand-green"
                      />
                    </label>
                  </div>

                  <label className="mt-6 block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">
                      {t('fields.email')}
                    </span>
                    <input
                      required
                      type="email"
                      value={values.email}
                      onChange={handleChange('email')}
                      className="w-full rounded-sm border border-stone-300 px-4 py-3 text-base outline-none transition-colors focus:border-brand-green"
                    />
                  </label>

                  <label className="mt-6 flex items-center gap-3 text-stone-700">
                    <input
                      type="checkbox"
                      checked={values.anonymous}
                      onChange={handleAnonymousChange}
                      className="h-4 w-4 rounded border-stone-300 text-brand-green focus:ring-brand-green"
                    />
                    <span>{t('fields.anonymous')}</span>
                  </label>

                  <label className="mt-6 block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">
                      {t('fields.comment')}
                    </span>
                    <textarea
                      rows={5}
                      value={values.comment}
                      onChange={handleChange('comment')}
                      className="w-full rounded-sm border border-stone-300 px-4 py-3 text-base outline-none transition-colors focus:border-brand-green"
                    />
                  </label>

                  <div className="mt-8 flex flex-col gap-5 border-t border-stone-200 pt-6 md:flex-row md:items-center md:justify-between">
                    <div className="inline-flex overflow-hidden rounded-sm border border-stone-300">
                      <span className="bg-stone-50 px-5 py-3 text-stone-700">
                        {t('summary.total')}
                      </span>
                      <span className="px-5 py-3 text-stone-900">
                        {amountIsValid ? formatDonationAmount(amountNumber) : '--'}
                      </span>
                    </div>

                    <ModernButton
                      type="submit"
                      buttonVariant="secondary"
                      size="large"
                      disabled={!amountIsValid}
                    >
                      {t('submit')}
                    </ModernButton>
                  </div>
                </div>
              </form>

              <aside className="flex flex-col gap-6">
                <div className="rounded-sm border border-stone-200 bg-white p-7 shadow-[0_22px_52px_-42px_rgba(28,25,23,0.35)]">
                  <span className="eyebrow text-brand-green">{t('sidebar.secureEyebrow')}</span>
                  <h2 className="mt-3 text-3xl text-stone-900">{t('sidebar.secureTitle')}</h2>
                  <p className="mt-4 leading-7 text-stone-600">{t('sidebar.secureBody')}</p>

                  <div className="mt-6 rounded-sm border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="text-sm uppercase tracking-[0.2em] text-stone-500">
                      {t('sidebar.campaignLabel')}
                    </div>
                    <div className="mt-2 text-lg text-stone-900">
                      {PAYPAL_DONATION_DEFAULTS.campaign}
                    </div>
                  </div>
                </div>

                <div className="rounded-sm border border-stone-200 bg-white p-7 shadow-[0_22px_52px_-42px_rgba(28,25,23,0.35)]">
                  <span className="eyebrow text-brand-gold">{t('sidebar.impactEyebrow')}</span>
                  <h2 className="mt-3 text-3xl text-stone-900">{t('sidebar.impactTitle')}</h2>
                  <ul className="mt-5 space-y-4 text-stone-600">
                    {(t('sidebar.impactItems', { returnObjects: true }) as string[]).map((item) => (
                      <li key={item} className="flex gap-3 leading-7">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, ['common', 'donate'])),
  },
});

export default DonatePage;
