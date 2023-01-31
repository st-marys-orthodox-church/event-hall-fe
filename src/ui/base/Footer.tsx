import Link from 'next/link';

import { CenteredSection } from '../layout/CenteredSection';
import { Section } from '../layout/Section';
import { Logo } from './Logo';
import { Instagram, Facebook } from '@mui/icons-material';
import { SOCIALS } from '../../utils/Constants';

const Footer = () => (
  <div className="bg-gray-100">
    <Section yPadding='py-8'>
      <CenteredSection
        logo={<Logo />}
      >
          <>
            <Link href={SOCIALS.FB} target="_blank">
              <a>
                <Facebook className="hover:text-primary-700 transition duration-150" />
              </a>
            </Link>

            <Link href={SOCIALS.IG} target="_blank">
                <a>
                  <Instagram className="hover:text-primary-700 transition duration-150" />
                </a>
              </Link>
            </>
      </CenteredSection>
    </Section>
  </div>
);

export { Footer };
