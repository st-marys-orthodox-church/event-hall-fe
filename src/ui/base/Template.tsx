import type { ReactNode } from 'react';
import { useScrolledPast } from '../../hooks';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type ITemplateProps = {
  children: ReactNode;
  topPad?: boolean;
  bottomPad?: boolean;
};

export const Template = (props: ITemplateProps) => {
  const isScrolled = useScrolledPast(0);
  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-sm transition-[background-color,box-shadow] duration-300 ease-refined border-b border-stone-200/60 ${
          isScrolled ? 'bg-white/95 shadow-soft' : 'bg-white'
        }`}
      >
        <Navbar />
      </div>
      {props.topPad && <div className="h-[81px] md:h-[68.5px]" />}
      <main className="opacity-100">{props.children}</main>
      {props.bottomPad && <div className="h-[68.5px]" />}
      <Footer />
    </>
  );
};
