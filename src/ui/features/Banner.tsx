import { Button } from '@mui/material';
import { ReactNode } from 'react';
import { useAppContext } from '../../stores/Global';

import { Section } from '../layout/Section';

type IBannerProps = {
  full?: boolean;
  color?: `bg-${string}`;
  children?: ReactNode;
  className?: string;
};
const Banner = ({ color, full, children, className }: IBannerProps) => {
  const { handleOpenModal } = useAppContext();
  const bgClass = color || 'bg-primary-100';
  const fullClass = full ? '!max-w-none !px-0 rounded-none' : '';
  const customClass = className || '';
  return (
    <Section className={fullClass}>
      {children ? (
        <div className={`p-4 sm:p-12 ${bgClass} ${customClass}`}>{children}</div>
      ) : (
        <div
          className={`text-center flex flex-col p-4 sm:text-left sm:flex-row sm:items-center sm:justify-between sm:p-12 rounded-md ${bgClass}`}
        >
          <div className="text-2xl font-semibold">
            <div className="text-gray-900">
              {'Interested in booking your next event with us?'}
            </div>
            <div className="text-primary-500">{'Reach out to us today.'}</div>
          </div>

          <div className="whitespace-no-wrap mt-3 sm:mt-0 sm:ml-2">
            <Button
              className="whitespace-nowrap bg-brand-green hover:bg-brand-green-dark"
              variant="contained"
              size="large"
              onClick={handleOpenModal}
            >
              Contact Us
            </Button>
          </div>
        </div>
      )}
    </Section>
  );
};

export { Banner };
