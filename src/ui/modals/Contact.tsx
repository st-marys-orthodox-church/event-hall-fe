import CloseIcon from '@mui/icons-material/Close';
import {
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'next-i18next/pages';
import * as React from 'react';
import { useContactForm, useWindowSize } from '../../hooks';
import { useAppContext } from '../../stores/Global';
import { COLORS, EASING } from '../../utils/DesignTokens';
import { ModernButton } from '../components/ModernButton';
import { WhatsAppButton } from '../components/WhatsAppButton';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  outline: 'none',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '2px',
    backgroundColor: '#ffffff',
    transition: `all 0.3s ${EASING.refined}`,
    '& fieldset': {
      borderColor: COLORS.neutral.outlineBorder,
    },
    '&:hover fieldset': {
      borderColor: COLORS.brand.gold,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.brand.green,
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: COLORS.neutral.outlineText,
    '&.Mui-focused': {
      color: COLORS.brand.green,
    },
  },
};

export function ContactModal() {
  const { handleCloseModal, modalOpen, prefilledDate } = useAppContext();
  const { width } = useWindowSize();
  const { t } = useTranslation('contact');
  const isMobile = width < 768;

  const [showForm, setShowForm] = React.useState(!isMobile);
  const {
    contactForm,
    updateContactForm,
    handleSubmit,
    isLoading,
    isError,
    isSuccess,
    determineMessage,
  } = useContactForm();

  React.useEffect(() => {
    setShowForm(!isMobile);
  }, [isMobile]);

  React.useEffect(() => {
    if (modalOpen && prefilledDate) {
      updateContactForm('date', prefilledDate);
      setShowForm(true);
    }
  }, [modalOpen, prefilledDate, updateContactForm]);

  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <Modal
      aria-labelledby="contact-form"
      aria-describedby={t('modal.ariaDescribedBy')}
      open={modalOpen}
      onClose={handleCloseModal}
      closeAfterTransition
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(15, 23, 23, 0.55)' } } }}
    >
      <Fade in={modalOpen}>
        <Box sx={style}>
          <div className="relative bg-white shadow-luxe mx-4 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-y-auto border-t-2 border-brand-gold">
            {/* Header */}
            <div className="flex justify-between items-start px-8 pt-8 pb-5">
              <div>
                <span className="eyebrow text-brand-gold">{t('modal.eyebrow')}</span>
                <h2 className="mt-2 font-display text-3xl md:text-4xl text-stone-900 leading-tight">
                  {t('modal.heading')}
                </h2>
                <div className="mt-3 w-10 h-px bg-brand-gold" />
                <p className="mt-3 text-sm text-stone-500 leading-relaxed max-w-sm">
                  {t('modal.subheading')}
                </p>
              </div>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  borderRadius: 0,
                  color: COLORS.neutral.outlineText,
                  '&:hover': {
                    backgroundColor: COLORS.neutral.darkBg,
                    color: COLORS.neutral.darkText,
                  },
                }}
                aria-label={t('modal.closeAriaLabel')}
              >
                <CloseIcon />
              </IconButton>
            </div>

            {/* WhatsApp Section */}
            <div className="px-8 pb-6">
              <div className="border border-stone-200 bg-stone-50/60 p-5">
                <div className="eyebrow text-stone-500 mb-3 text-center">
                  {t('whatsappSection.label')}
                </div>
                <WhatsAppButton
                  fullWidth
                  size="large"
                  guests={contactForm.cap || undefined}
                  date={contactForm.date ? contactForm.date.toLocaleDateString() : undefined}
                />
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="eyebrow text-stone-500 hover:text-brand-green transition-colors duration-300 border-b border-transparent hover:border-brand-gold pb-0.5"
                  >
                    {showForm ? t('whatsappSection.hideForm') : t('whatsappSection.showForm')}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Collapse in={showForm} timeout="auto" unmountOnExit>
              <div className="px-8 pb-8">
                <div className="flex items-center gap-4 mb-5">
                  <span className="h-px w-8 bg-brand-gold" />
                  <Typography className="eyebrow text-stone-600 !tracking-[0.22em]">
                    {t('form.divider')}
                  </Typography>
                  <span className="flex-1 h-px bg-stone-200" />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <FormControl fullWidth required>
                      <TextField
                        id="contact-form-name"
                        value={contactForm.name}
                        label={t('form.fields.fullName')}
                        onChange={(e) => updateContactForm('name', e.target.value)}
                        variant="outlined"
                        required
                        sx={fieldSx}
                      />
                    </FormControl>
                    <FormControl fullWidth required>
                      <TextField
                        required
                        type="text"
                        id="contact-form-email"
                        value={contactForm.email}
                        label={t('form.fields.email')}
                        onChange={(e) => updateContactForm('email', e.target.value)}
                        variant="outlined"
                        sx={fieldSx}
                      />
                    </FormControl>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <FormControl fullWidth required>
                      <DesktopDatePicker
                        label={t('form.fields.date')}
                        format={t('form.fields.dateFormat')}
                        value={contactForm.date}
                        onChange={(e) => updateContactForm('date', e?.toDate() || null)}
                        slotProps={{ textField: { sx: fieldSx } }}
                      />
                    </FormControl>
                    <FormControl fullWidth required>
                      <TextField
                        required
                        type="number"
                        id="contact-form-cap"
                        value={contactForm.cap}
                        label={t('form.fields.guests')}
                        onChange={(e) => updateContactForm('cap', e.target.value)}
                        variant="outlined"
                        sx={fieldSx}
                      />
                    </FormControl>
                  </div>
                  <FormControl fullWidth required>
                    <TextField
                      id="contact-form-message"
                      value={contactForm.message}
                      label={t('form.fields.message')}
                      onChange={(e) => updateContactForm('message', e.target.value)}
                      variant="outlined"
                      multiline
                      minRows={3}
                      required
                      sx={fieldSx}
                    />
                  </FormControl>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 mt-6">
                  <ModernButton
                    buttonVariant={isError ? 'outline' : 'primary'}
                    size="large"
                    onClick={handleSubmit}
                    disabled={isSuccess || isError || isLoading}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {determineMessage()}
                      {isLoading && <CircularProgress size={14} sx={{ color: 'inherit' }} />}
                    </span>
                  </ModernButton>
                </div>
              </div>
            </Collapse>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
