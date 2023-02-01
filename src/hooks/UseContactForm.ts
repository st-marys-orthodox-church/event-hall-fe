import { useState } from 'react';

export const useContactForm = () => {
  const [contactForm, setContactForm] = useState<any>({
    name: '',
    date: null,
    message: '',
    cap: '',
  });

  const updateContactForm = (
    key: 'name' | 'date' | 'message' | 'cap',
    value: string | Date
  ) => {
    setContactForm({
      ...contactForm,
      [key]: value,
    });
  };

  return {
    contactForm,
    updateContactForm,
  };
};
