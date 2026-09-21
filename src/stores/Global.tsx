import { type ReactNode, createContext, useContext, useState } from 'react';
import type { ViewingPrefill } from '../utils/Viewings';

// Types
type IStoreProps = {
  modalOpen: boolean;
  prefilledDate: Date | null;
  handleOpenModal: (date?: Date) => void;
  handleCloseModal: () => void;
  viewingOpen: boolean;
  viewingPrefill: ViewingPrefill | null;
  handleOpenViewing: (prefill?: ViewingPrefill) => void;
  handleCloseViewing: () => void;
};

// Context
const AppContext = createContext<IStoreProps>({
  modalOpen: false,
  prefilledDate: null,
  handleCloseModal() {},
  handleOpenModal() {},
  viewingOpen: false,
  viewingPrefill: null,
  handleOpenViewing() {},
  handleCloseViewing() {},
});

// Wrapper
export function AppWrapper(props: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [viewingPrefill, setViewingPrefill] = useState<ViewingPrefill | null>(null);
  const handleOpenModal = (date?: Date) => {
    setPrefilledDate(date instanceof Date ? date : null);
    setViewingOpen(false);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setPrefilledDate(null);
  };
  const handleOpenViewing = (prefill?: ViewingPrefill) => {
    setViewingPrefill(prefill ?? null);
    setModalOpen(false);
    setViewingOpen(true);
  };
  const handleCloseViewing = () => {
    setViewingOpen(false);
    setViewingPrefill(null);
  };

  return (
    <AppContext.Provider
      value={{
        modalOpen,
        prefilledDate,
        handleOpenModal,
        handleCloseModal,
        viewingOpen,
        viewingPrefill,
        handleOpenViewing,
        handleCloseViewing,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

// Independent
export function useAppContext() {
  return useContext(AppContext);
}
