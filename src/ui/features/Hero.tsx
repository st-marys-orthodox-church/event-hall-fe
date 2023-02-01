import { Facebook, Instagram } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useWindowSize } from '../../hooks/UseWindowDimensions';
import { SOCIALS } from '../../utils/Constants';
import { Section } from '../layout/Section';

const Hero = () => {
  const { width } = useWindowSize();
  return (
    <div
      className={`bg-[url('/photos/hero-bg.JPG')] bg-cover bg-center h-screen flex items-center w-full`}
    >
      <Section
        className="w-full flex flex-col gap-3 items-center justify-center"
        yPadding="py-16"
      >
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
        <header className="backdrop-brightness-75 rounded-md text-center py-4 px-8 w-fit">
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
      </Section>
    </div>
  );
};

export { Hero };
