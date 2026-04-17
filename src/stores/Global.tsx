import { type ReactNode, createContext, useContext, useState } from 'react';

// Types
type IStoreProps = {
  modalOpen: boolean;
  prefilledDate: Date | null;
  handleOpenModal: (date?: Date) => void;
  handleCloseModal: () => void;
};

// Context
const AppContext = createContext<IStoreProps>({
  modalOpen: false,
  prefilledDate: null,
  handleCloseModal() {},
  handleOpenModal() {},
});

// Wrapper
export function AppWrapper(props: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const handleOpenModal = (date?: Date) => {
    setPrefilledDate(date instanceof Date ? date : null);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setPrefilledDate(null);
  };

  return (
    <AppContext.Provider
      value={{
        modalOpen,
        prefilledDate,
        handleOpenModal,
        handleCloseModal,
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
