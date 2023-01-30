import React, { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type ITemplateProps = {
    children: ReactNode;
    topPad?: boolean;
}

export const Template = (props: ITemplateProps) => {
    return (
        <>
        <div className="bg-neutral-100 shadow-md fixed w-full z-50">
        <Navbar />
        </div>
        {props.topPad && (<div className="h-[68.5px]" />)}
        {props.children}
        <Footer />
        </>
    )
}