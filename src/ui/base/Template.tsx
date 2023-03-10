import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { useWindowSize } from '../../hooks';
import FadeIn from '../components/FadeIn';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type ITemplateProps = {
  children: ReactNode;
  topPad?: boolean;
};

export const Template = (props: ITemplateProps) => {
  const { pathname } = useRouter();
  const { scrollY } = useWindowSize();
  return (
    <>
      <FadeIn disabled={pathname !== '/'}>
        <div
          className={`bg-white shadow-md ${
            scrollY > 0 ? 'fixed' : 'absolute'
          } w-full z-50`}
        >
          <Navbar />
        </div>
      </FadeIn>
      {props.topPad && <div className="h-[68.5px]" />}
      {props.children}
      <Footer />
    </>
  );
};
