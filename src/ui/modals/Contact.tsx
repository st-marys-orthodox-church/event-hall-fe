import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloseIcon from '@mui/icons-material/Close'
import { useAppContext } from '../../stores/Global';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { getFutureDates } from '../../utils/Helpers';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
    justifyContent: 'center'
};

export function ContactModal() {
    const { handleCloseModal, modalOpen } = useAppContext();
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
                    <h5 className="text-2xl font-semibold">Send us a message!</h5>
                    <Button className="min-w-0" onClick={handleCloseModal}>
                        <CloseIcon />
                    </Button>
                </div>
                <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <FormControl fullWidth>
                  <TextField
                    id="contact-form-name"
                    value={''}
                    label="Full Name"
                    onChange={() => {}}
                    variant="outlined"
                  />
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="contact-form-date">Date</InputLabel>
                  <Select
                    labelId="contact-form-date"
                    id="contact-form-date"
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
                <FormControl fullWidth>
                  <InputLabel id="contact-modal-package">Package Interested In</InputLabel>
                  <Select
                    labelId="contact-modal-package"
                    id="contact-modal-package"
                    value={''}
                    label="Package Interested In"
                    onChange={() => {}}
                  >
                    {[1, 2, 3].map((el, i) => (
                      <MenuItem key={`date-dropdown-${i}`} value={el}>
                        {`Package ${el}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <TextField
                    id="contact-form-message"
                    value={''}
                    label="Message"
                    onChange={() => {}}
                    variant="outlined"
                    multiline
                    minRows={3}
                  />
                </FormControl>
              </div>
              <div className="flex justify-end">
                <Button variant="contained" className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto">
                    Send Message
                </Button>
              </div>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}