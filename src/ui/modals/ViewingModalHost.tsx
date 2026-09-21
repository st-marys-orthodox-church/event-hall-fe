import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../stores/Global';

const ViewingModal = dynamic(() => import('./Viewing').then((m) => m.ViewingModal), {
  ssr: false,
});

export const ViewingModalHost = () => {
  const { viewingOpen } = useAppContext();
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (viewingOpen) setEverOpened(true);
  }, [viewingOpen]);

  return everOpened ? <ViewingModal /> : null;
};
