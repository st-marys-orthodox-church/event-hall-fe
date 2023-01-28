import React, { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type ITemplateProps = {
    children: ReactNode;
}

export const Template = (props: ITemplateProps) => {
    return (
        <>
        <div className="bg-neutral-100 shadow-md fixed w-full z-50">
        <Navbar />
        </div>
        {props.children}
        <Footer />
        </>
    )
}