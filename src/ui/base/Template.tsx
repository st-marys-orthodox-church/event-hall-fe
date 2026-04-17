import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useWindowSize } from '../../hooks';
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
      <div
        className={`w-full z-50 transition-all duration-500 ease-refined ${
          scrollY > 0
            ? 'fixed bg-white/95 backdrop-blur-sm shadow-soft border-b border-stone-200/60'
            : 'absolute bg-white border-b border-stone-200/60'
        }`}
      >
        <Navbar />
      </div>
      {props.topPad && <div className="h-[68.5px]" />}
      <main className="opacity-100">{props.children}</main>
      <Footer />
    </>
  );
};
