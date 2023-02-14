import { Facebook, Instagram } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useWindowSize } from '../../hooks/UseWindowDimensions';
import { SOCIALS } from '../../utils/Constants';
import { Section } from '../layout/Section';
import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';

const Hero = () => {
  const { width } = useWindowSize();
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsShowing(true), 500);
    return () => clearTimeout(timeout);
  });

  return (
    <div
      className={`bg-[url('/photos/hero-bg.JPG')] bg-cover bg-center h-screen flex items-center w-full`}
    >
      <Section
        className="w-full flex flex-col gap-3 items-center justify-center !max-w-none !px-0"
        yPadding="py-16"
      >
        <Transition
          show={isShowing}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="w-full flex flex-col gap-3 items-center justify-center !max-w-none !px-0"
        >
          <>
            <div className="flex items-center gap-3 text-white">
              <Link href={SOCIALS.FB} target="_blank">
                <a>
                  <Facebook
                    color="inherit"
                    className="hover:text-primary-200 transition duration-150"
                  />
                </a>
              </Link>

              <Link href={SOCIALS.IG} target="_blank">
                <a>
                  <Instagram
                    color="inherit"
                    className="hover:text-primary-200 transition duration-150"
                  />
                </a>
              </Link>
            </div>

            <header className="text-center py-4 w-full">
              <h3 className="text-4xl text-white font-bold tracking-wide">
                {width > 600 ? (
                  `Fellowship Event Hall`
                ) : (
                  <>
                    Fellowship
                    <br />
                    Event Hall
                  </>
                )}
              </h3>
              <span className="text-3xl text-white">Dacula, GA</span>
            </header>

            <Link href="/gallery">
              <a>
                <Button
                  className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 w-fit"
                  variant="contained"
                  size="large"
                >
                  Gallery
                </Button>
              </a>
            </Link>
          </>
        </Transition>
      </Section>
    </div>
  );
};

export { Hero };
