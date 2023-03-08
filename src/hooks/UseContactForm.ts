import React, { useEffect, useState } from 'react';

export const useContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
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

  const clearForm = () => setContactForm({
    name: '',
    date: null,
    message: '',
    cap: '',
    email: '',
    package: '',
  });

  const determineMessage = () => {
    if(isLoading) return 'Sending';
    if(isSuccess) return 'Successfully Sent'
    if(isError) return 'Error Sending Message'
    return 'Send'
  }

  const determineButtonColor = () => {
    if(isSuccess) return '!bg-green-400 !text-neutral-100';
    if(isError) return '!bg-red-400 !text-neutral-100';
    return 'bg-blue-500 hover:bg-blue-600'
  }

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
      setIsError(true)
      console.error(error);
    } else {
      setIsSuccess(true);
      clearForm();
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsError(false);
      setIsSuccess(false);
    }, 3000)

    return (() => clearTimeout(timeout))
  }, [isSuccess, isError])

  return {
    contactForm,
    updateContactForm,
    handleSubmit,
    isLoading,
    clearForm,
    isError,
    isSuccess,
    determineMessage,
    determineButtonColor
  };
};
