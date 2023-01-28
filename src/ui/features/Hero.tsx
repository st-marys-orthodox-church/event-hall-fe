import {
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Link from 'next/link';

import { useWindowSize } from '../../hooks/UseWindowDimensions';
import { getFutureDates } from '../../utils/Helpers';
import { Section } from '../layout/Section';

const Hero = () => {
  const { width, breakpoint } = useWindowSize();
  return (
    <div
      className={`bg-[url('/photos/hero-bg.jpeg')] bg-cover h-screen flex items-end w-full`}
    >
      <Section className="w-full" yPadding="py-16">
        <header>
          <Card className="flex flex-col lg:flex-row gap-3 lg:gap-6 justify-between p-3 md:p-4 pb-2">
            <div className="flex flex-col gap-3 w-full">
              <h3 className="text-2xl font-bold uppercase">
                {width > breakpoint
                  ? 'Book your next event with us!'
                  : 'Book with us now!'}
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <FormControl fullWidth>
                  <TextField
                    id="hero-name"
                    value={''}
                    label="Full Name"
                    onChange={() => {}}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="hero-date">Date</InputLabel>
                  <Select
                    labelId="hero-date"
                    id="hero-date"
                    value={''}
                    label="Date"
                    onChange={() => {}}
                  >
                    {getFutureDates(new Date(), 14).map((el, i) => (
                      <MenuItem key={`date-dropdown-${i}`} value={el}>
                        {el}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end lg:flex-col gap-3">
              <Link href="/packages">
              <Button className="whitespace-nowrap" size="large">
                See Packages
              </Button>
              </Link>
              <Button
                className="whitespace-nowrap bg-blue-500 hover:bg-blue-600"
                variant="contained"
                size="large"
              >
                Send Interest
              </Button>
            </div>
          </Card>
        </header>
      </Section>
    </div>
  );
};

export { Hero };
