import { Facebook, Instagram } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { SOCIALS } from '../../utils/Constants';
import { Section } from '../layout/Section';
import FadeIn from '../components/FadeIn';
import Image from 'next/image';

const Hero = () => {
  return (
    <div
      className={`bg-[url('/photos/hero-bg.JPG')] bg-cover bg-center h-screen flex items-center w-full`}
    >
      <Section
        className="w-full flex flex-col gap-3 items-center justify-center !max-w-none !px-0"
        yPadding="py-16"
      >
        <FadeIn>
          <div className="w-full flex flex-col gap-3 items-center justify-center !max-w-none !px-0">
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
              <h3 className="text-4xl text-white font-bold tracking-wide leading-none">
                {/* {width > 600 ? (
                  `Fellowship Event Hall`
                ) : (
                  <>
                    Fellowship
                    <br />
                    Event Hall
                  </>
                )} */}
                <Image
                  src={`/logos/logo-words-tp.png`}
                  alt="Fellowship Event Hall - Host Events"
                  width="420"
                  height="90"
                />
              </h3>
              <span className="text-xl font-semibold italic text-white">
                An event hall suited for all your needs.
                <br />
                Located in Dacula, GA
              </span>
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
          </div>
        </FadeIn>
      </Section>
    </div>
  );
};

export { Hero };
