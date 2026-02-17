import { Transition } from '@headlessui/react';
import React, { ReactNode, useEffect, useState } from 'react';

type IFadeInProps = {
  children: ReactNode;
  delay?: number;
  disabled?: boolean;
  duration?: `duration-${string}`;
};

const FadeIn = ({
  children,
  disabled,
  duration = 'duration-1000',
  delay = 500,
}: IFadeInProps) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsShowing(true), delay);
    return () => clearTimeout(timeout);
  });
  return (
    <Transition
      show={disabled || isShowing}
      enter={`transition-opacity ${duration}`}
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  );
};

export default FadeIn;
