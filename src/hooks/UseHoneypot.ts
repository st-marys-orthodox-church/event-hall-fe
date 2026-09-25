import { useCallback, useRef, useState } from 'react';
import type { HoneypotFields } from '../utils/Honeypot';

/**
 * State for one form's honeypot: the hidden field's value and when the form was opened.
 * Spread `payload()` into the request body; call `restart()` whenever the form is shown afresh.
 */
export const useHoneypot = () => {
  const [website, setWebsite] = useState('');
  const openedAt = useRef(Date.now());

  const restart = useCallback(() => {
    openedAt.current = Date.now();
    setWebsite('');
  }, []);

  const payload = (): HoneypotFields => ({
    website,
    fillTime: Date.now() - openedAt.current,
  });

  return { fieldProps: { value: website, onChange: setWebsite }, payload, restart };
};
