import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import * as React from 'react';
import { useContactForm, useWindowSize } from '../../hooks';
import { useAppContext } from '../../stores/Global';
import { WhatsAppButton } from '../components/WhatsAppButton';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

export function ContactModal() {
  const { handleCloseModal, modalOpen } = useAppContext();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  // Form visibility state - hidden by default on mobile, visible on desktop
  const [showForm, setShowForm] = React.useState(!isMobile);
  const {
    contactForm,
    updateContactForm,
    handleSubmit,
    isLoading,
    isError,
    isSuccess,
    determineMessage,
    determineButtonColor,
  } = useContactForm();

  // Update showForm when isMobile changes
  React.useEffect(() => {
    setShowForm(!isMobile);
  }, [isMobile]);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <>
      <Modal
        aria-labelledby="contact-form"
        aria-describedby="contact form to book the event hall"
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
          <Box sx={style}>
            <div className="p-4 bg-neutral-100 rounded mx-4 max-w-2xl w-full flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-2xl font-semibold">Get in Touch</h5>
                  <p className="text-neutral-600 text-sm mt-1">
                    We&apos;d love to hear about your event!
                  </p>
                </div>
                <Button className="min-w-0" onClick={handleCloseModal}>
                  <CloseIcon />
                </Button>
              </div>

              {/* WhatsApp Section - Primary CTA */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <WhatsAppButton
                  fullWidth
                  size="large"
                  guests={contactForm.cap || undefined}
                  date={contactForm.date ? contactForm.date.toLocaleDateString() : undefined}
                />

                {/* Toggle Form Link */}
                <div className="text-center mt-3">
                  <Button
                    onClick={toggleForm}
                    className="text-neutral-600 underline text-sm normal-case"
                    size="small"
                  >
                    {showForm ? 'Hide contact form' : "Don't have WhatsApp?"}
                  </Button>
                </div>
              </div>

              {/* Collapsible Contact Form */}
              <Collapse in={showForm} timeout="auto" unmountOnExit>
                <Divider className="my-2" />
                <Typography variant="h6" className="text-lg font-semibold mb-3">
                  Send us a message
                </Typography>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <FormControl fullWidth required>
                      <TextField
                        id="contact-form-name"
                        value={contactForm.name}
                        label="Full Name"
                        onChange={(e) => updateContactForm('name', e.target.value)}
                        variant="outlined"
                        required
                      />
                    </FormControl>
                    <FormControl fullWidth required>
                      <TextField
                        required
                        type="text"
                        id="contact-form-email"
                        value={contactForm.email}
                        label="Email"
                        onChange={(e) => updateContactForm('email', e.target.value)}
                        variant="outlined"
                      />
                    </FormControl>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    <FormControl fullWidth required>
                      <DesktopDatePicker
                        label="Date"
                        inputFormat="MM/DD/YYYY"
                        value={contactForm.date}
                        onChange={(e) => updateContactForm('date', e?.toDate() || null)}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </FormControl>
                    <FormControl fullWidth required>
                      <TextField
                        required
                        type="number"
                        id="contact-form-cap"
                        value={contactForm.cap}
                        label="Amount of People"
                        onChange={(e) => updateContactForm('cap', e.target.value)}
                        variant="outlined"
                      />
                    </FormControl>
                  </div>
                  <FormControl fullWidth required>
                    <TextField
                      id="contact-form-message"
                      value={contactForm.message}
                      label="Message"
                      onChange={(e) => updateContactForm('message', e.target.value)}
                      variant="outlined"
                      multiline
                      minRows={3}
                      required
                    />
                  </FormControl>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="contained"
                    className={`${determineButtonColor()} w-full md:w-auto flex items-center gap-2`}
                    onClick={handleSubmit}
                    disabled={isSuccess || isError || isLoading}
                  >
                    {determineMessage()} {isLoading && <CircularProgress size={16} />}
                  </Button>
                </div>
              </Collapse>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
