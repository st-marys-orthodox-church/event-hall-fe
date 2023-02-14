import React, { useState } from 'react';

export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contactForm, setContactForm] = useState<any>({
    name: '',
    date: null,
    message: '',
    cap: '',
    email: '',
    package: '',
  });

  const updateContactForm = (
    key: 'name' | 'date' | 'message' | 'cap' | 'email' | 'package',
    value: string | Date
  ) => {
    setContactForm({
      ...contactForm,
      [key]: value,
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/sendgrid', {
      body: JSON.stringify(contactForm),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    setIsLoading(false);

    const { error } = await res.json();
    if (error) {
      console.error(error);
    }
  };

  return {
    contactForm,
    updateContactForm,
    handleSubmit,
    isLoading,
  };
};
