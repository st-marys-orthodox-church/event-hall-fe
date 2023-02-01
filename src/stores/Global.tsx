import { createContext, ReactNode, useContext, useState } from 'react';

// Types
type IStoreProps = {
  modalOpen: boolean;
  handleOpenModal: () => void;
  handleCloseModal: () => void;
};

// Context
const AppContext = createContext<IStoreProps>({
  modalOpen: false,
  handleCloseModal() {},
  handleOpenModal() {},
});

// Wrapper
export function AppWrapper(props: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <AppContext.Provider
      value={{
        modalOpen,
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
