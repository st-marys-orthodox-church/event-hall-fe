import { Button } from '@mui/material';
import Link from 'next/link';
import { useAppContext } from '../../stores/Global';

import { Section } from '../layout/Section';

const Banner = () => {
  const {handleOpenModal} = useAppContext();
  return (
  <Section>
      <div className="text-center flex flex-col p-4 sm:text-left sm:flex-row sm:items-center sm:justify-between sm:p-12 bg-primary-100 rounded-md">
    <div className="text-2xl font-semibold">
      <div className="text-gray-900">{"Interested in booking your next event with us?"}</div>
      <div className="text-primary-500">{"Reach out to us today."}</div>
    </div>

    <div className="whitespace-no-wrap mt-3 sm:mt-0 sm:ml-2">
    <Link href="#">
          <a>
            <Button className="whitespace-nowrap bg-blue-500 hover:bg-blue-600" variant='contained' size="large" onClick={handleOpenModal}>Contact Us</Button>
          </a>
        </Link>    </div>
  </div>
  </Section>
)
  }

export { Banner };
