import MenuIcon from '@mui/icons-material/Menu';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import Link from 'next/link';
import { useDropdown, useWindowSize } from '../../hooks';
import { useAppContext } from '../../stores/Global';
import { generateWhatsAppUrl } from '../../utils/Constants';
import { COLORS, EASING } from '../../utils/DesignTokens';
import { NAV_LINKS } from '../../utils/Navigation';
import { Section } from '../layout/Section';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

export const Navbar = () => {
  const { handleOpenModal } = useAppContext();
  const { width } = useWindowSize();
  const { open, handleClick, handleClose, anchorEl } = useDropdown();
  const { t } = useTranslation('common');

  const links = NAV_LINKS;

  return (
    <Section yPadding="py-3">
      <div className="flex justify-between items-center gap-6">
        <Link href="/" className="flex items-center" aria-label={t('nav.homeAriaLabel')}>
          <Logo />
        </Link>

        <nav>
          {width > 768 ? (
            <ul className="flex items-center gap-8">
              {links.map((el) => (
                <li key={`nav-item-${el.key}`}>
                  <Link
                    href={el.link}
                    className="eyebrow text-stone-700 hover:text-brand-green transition-colors duration-300 ease-refined relative group"
                  >
                    {t(`nav.${el.key}`)}
                    <span className="absolute -bottom-1.5 left-0 w-full h-px bg-brand-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-refined" />
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-3 pl-4 border-l border-stone-200">
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="eyebrow text-stone-700 hover:text-brand-green border border-stone-300 hover:border-brand-green px-4 py-2 transition-colors duration-300 ease-refined"
                >
                  {t('nav.contactUs')}
                </button>
                <Tooltip title={t('whatsapp.chat')}>
                  <IconButton
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      borderRadius: 0,
                      color: COLORS.brand.green,
                      width: 40,
                      height: 40,
                      transition: `all 0.3s ${EASING.refined}`,
                      '&:hover': {
                        backgroundColor: COLORS.brand.green,
                        color: 'white',
                      },
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <LanguageSwitcher size="small" />
              </li>
            </ul>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="eyebrow text-stone-700 border border-stone-300 px-3 py-1.5"
              >
                {t('nav.contact')}
              </button>
              <Tooltip title={t('whatsapp.chat')}>
                <IconButton
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    borderRadius: 0,
                    color: COLORS.brand.green,
                    width: 36,
                    height: 36,
                  }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <LanguageSwitcher size="small" />
              <Tooltip title={t('nav.navigation')}>
                <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? 'navbar-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  sx={{ borderRadius: 0 }}
                >
                  <MenuIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="navbar-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: 0,
                      mt: 1,
                      boxShadow: '0 10px 30px -12px rgba(15, 23, 23, 0.18)',
                      minWidth: 180,
                    },
                  },
                }}
              >
                {links.map((el) => (
                  <MenuItem
                    component={Link}
                    href={el.link}
                    key={`nav-dropdown-${el.key}`}
                    onClick={handleClose}
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      fontSize: '0.75rem',
                      color: COLORS.neutral.mutedText,
                      py: 1.25,
                    }}
                  >
                    {t(`nav.${el.key}`)}
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => handleOpenModal()}
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    fontSize: '0.75rem',
                    color: COLORS.brand.green,
                    py: 1.25,
                  }}
                >
                  {t('nav.contactForm')}
                </MenuItem>
              </Menu>
            </div>
          )}
        </nav>
      </div>
    </Section>
  );
};
