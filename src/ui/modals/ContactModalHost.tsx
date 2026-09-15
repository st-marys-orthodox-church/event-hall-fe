import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../stores/Global';

const ContactModal = dynamic(() => import('./Contact').then((m) => m.ContactModal), {
  ssr: false,
});

// The modal pulls in the date picker and moment; keep them out of the shared
// bundle until someone actually opens it, then keep it mounted for the close animation.
export const ContactModalHost = () => {
  const { modalOpen } = useAppContext();
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (modalOpen) setEverOpened(true);
  }, [modalOpen]);

  return everOpened ? <ContactModal /> : null;
};
