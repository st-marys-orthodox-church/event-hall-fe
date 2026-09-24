import { useTranslation } from 'next-i18next/pages';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAppContext } from '../stores/Global';
import { trackEvent } from '../utils/Analytics';
import { getLeadSource } from '../utils/LeadSource';

export type ContactFormState = {
  name: string;
  date: Date | null;
  message: string;
  cap: string;
  email: string;
  package: string;
  website: string;
};

export const useContactForm = () => {
  const { t } = useTranslation('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const { handleCloseModal } = useAppContext();
  const [contactForm, setContactForm] = useState<ContactFormState>({
    name: '',
    date: null,
    message: '',
    cap: '',
    email: '',
    package: '',
    website: '',
  });

  const updateContactForm = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) => {
    setContactForm({
      ...contactForm,
      [key]: value,
    });
  };

  const clearForm = () =>
    setContactForm({
      name: '',
      date: null,
      message: '',
      cap: '',
      email: '',
      package: '',
      website: '',
    });

  const determineMessage = () => {
    if (isLoading) return t('form.buttons.sending');
    if (isSuccess) return t('form.buttons.success');
    if (isError) return t('form.buttons.error');
    return t('form.buttons.send');
  };

  const determineButtonColor = () => {
    if (isSuccess) return '!bg-green-400 !text-neutral-100';
    if (isError) return '!bg-red-400 !text-neutral-100';
    return 'bg-brand-green hover:bg-brand-green-dark';
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/sendgrid', {
      body: JSON.stringify({ ...contactForm, leadSource: getLeadSource() }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    setIsLoading(false);

    const { error } = await res.json();
    if (error) {
      setIsError(true);
      console.error(error);
    } else {
      trackEvent('contact_form_submit', { event_category: 'conversion' });
      setIsSuccess(true);
      clearForm();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleCloseModal is a stable context callback
  useEffect(() => {
    if (isSuccess || isError) {
      const timeout = setTimeout(() => {
        handleCloseModal();
        setIsError(false);
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [isSuccess, isError]);

  return {
    contactForm,
    updateContactForm,
    handleSubmit,
    isLoading,
    clearForm,
    isError,
    isSuccess,
    determineMessage,
    determineButtonColor,
  };
};
