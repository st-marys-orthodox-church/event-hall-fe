import {
  Button,
  Card,
  FormControl,
  TextField,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Link from 'next/link';
import { useContactForm } from '../../hooks';
import { useWindowSize } from '../../hooks/UseWindowDimensions';
import { Section } from '../layout/Section';

const Hero = () => {
  const { width, breakpoint } = useWindowSize();
  const { contactForm, updateContactForm } = useContactForm();
  return (
    <div
      className={`bg-[url('/photos/hero-bg.jpeg')] bg-cover bg-center h-screen flex items-end w-full `}
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
                    value={contactForm.name}
                    label="Full Name"
                    onChange={(e) => updateContactForm('name', e.target.value)}
                    variant="outlined"
                    size='medium'
                  />
                </FormControl>
                <FormControl fullWidth>
                  <DesktopDatePicker
          label="Date"
          inputFormat="MM/DD/YYYY"
          value={contactForm.date}
          onChange={(e) => updateContactForm('date', e)}
          renderInput={(params) => <TextField {...params} />}
        />
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
                Send Inquiry
              </Button>
            </div>
          </Card>
        </header>
      </Section>
    </div>
  );
};

export { Hero };
