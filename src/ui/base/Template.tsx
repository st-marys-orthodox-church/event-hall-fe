import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import FadeIn from '../components/FadeIn';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type ITemplateProps = {
  children: ReactNode;
  topPad?: boolean;
};

export const Template = (props: ITemplateProps) => {
  const { pathname } = useRouter();
  return (
    <>
      <FadeIn disabled={pathname !== '/'}>
        <div className="bg-white shadow-md fixed w-full z-50">
          <Navbar />
        </div>
      </FadeIn>
      {props.topPad && <div className="h-[68.5px]" />}
      {props.children}
      <Footer />
    </>
  );
};
