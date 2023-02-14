import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloseIcon from '@mui/icons-material/Close';
import { useAppContext } from '../../stores/Global';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { useContactForm } from '../../hooks';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

export function ContactModal() {
  const { handleCloseModal, modalOpen } = useAppContext();
  const { contactForm, updateContactForm, handleSubmit, isLoading } =
    useContactForm();

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
            <div className="p-4 bg-neutral-100 rounded mx-4 max-w-2xl w-full flex flex-col gap-4">
              <div className="flex justify-between">
                <h5 className="text-2xl font-semibold">Send a message!</h5>
                <Button className="min-w-0" onClick={handleCloseModal}>
                  <CloseIcon />
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <FormControl fullWidth required>
                    <TextField
                      id="contact-form-name"
                      value={contactForm.name}
                      label="Full Name"
                      onChange={(e) =>
                        updateContactForm('name', e.target.value)
                      }
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
                      onChange={(e) =>
                        updateContactForm('email', e.target.value)
                      }
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
                      onChange={(e) => updateContactForm('date', e.toDate())}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel id="contact-modal-package">
                      Select Package
                    </InputLabel>
                    <Select
                      required
                      labelId="contact-modal-package"
                      id="contact-modal-package"
                      value={contactForm.package}
                      label="Select Package"
                      onChange={(e) =>
                        updateContactForm('package', e.target.value)
                      }
                    >
                      {[1, 2, 3].map((el, i) => (
                        <MenuItem key={`date-dropdown-${i}`} value={el}>
                          {`Package ${el}`}
                        </MenuItem>
                      ))}
                    </Select>
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
                    onChange={(e) =>
                      updateContactForm('message', e.target.value)
                    }
                    variant="outlined"
                    multiline
                    minRows={3}
                    required
                  />
                </FormControl>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Sending' : 'Send'}
                </Button>
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
