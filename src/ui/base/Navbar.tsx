import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Drawer, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useWindowSize } from '../../hooks';
import { useAppContext } from '../../stores/Global';
import { generateWhatsAppUrl } from '../../utils/Constants';
import { COLORS, EASING } from '../../utils/DesignTokens';
import { NAV_LINKS } from '../../utils/Navigation';
import { Section } from '../layout/Section';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

export const Navbar = () => {
  const { handleOpenModal } = useAppContext();
  const { scrollY } = useWindowSize();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = NAV_LINKS;
  const isScrolled = scrollY > 50;
  const closeDrawer = () => setDrawerOpen(false);
  const isActive = (link: string) => router.pathname === link;

  return (
    <Section
      yPadding={isScrolled ? 'py-1.5' : 'py-3'}
      className="transition-[padding] duration-300 ease-refined"
    >
      <div className="flex justify-between items-center gap-6">
        <Link href="/" className="flex items-center" aria-label={t('nav.homeAriaLabel')}>
          <Logo />
        </Link>

        <nav>
          <ul className="hidden md:flex items-center gap-8">
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
              <Link
                href="/#availability"
                className="eyebrow text-stone-700 hover:text-brand-green border border-stone-300 hover:border-brand-green px-4 py-2 transition-colors duration-300 ease-refined"
              >
                {t('nav.contactUs')}
              </Link>
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

          <div className="flex md:hidden items-center gap-1">
            <Tooltip title={t('whatsapp.chat')}>
              <IconButton
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('whatsapp.chat')}
                sx={{ borderRadius: 0, color: COLORS.brand.green, width: 44, height: 44 }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen ? 'true' : undefined}
              sx={{ borderRadius: 0, color: COLORS.neutral.darkText, width: 44, height: 44 }}
            >
              <MenuIcon />
            </IconButton>
          </div>
        </nav>
      </div>

      <Drawer
        id="mobile-menu"
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: false }}
        slotProps={{
          paper: {
            sx: {
              width: 'min(85vw, 360px)',
              borderRadius: 0,
              boxShadow: '0 20px 50px -20px rgba(15, 23, 23, 0.35)',
            },
          },
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
            <Link
              href="/"
              onClick={closeDrawer}
              className="flex items-center"
              aria-label={t('nav.homeAriaLabel')}
            >
              <Logo />
            </Link>
            <IconButton
              onClick={closeDrawer}
              aria-label={t('nav.closeMenu')}
              sx={{ borderRadius: 0, color: COLORS.neutral.darkText, width: 44, height: 44 }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <ul className="flex flex-col px-5 py-4">
            <li>
              <Link
                href="/"
                onClick={closeDrawer}
                aria-current={isActive('/') ? 'page' : undefined}
                className={`flex items-center justify-between py-4 font-display text-3xl border-b border-stone-100 transition-colors duration-300 ease-refined ${
                  isActive('/') ? 'text-brand-green-ink' : 'text-stone-900 hover:text-brand-green'
                }`}
              >
                {t('nav.home')}
                {isActive('/') && <span className="w-6 h-px bg-brand-gold" />}
              </Link>
            </li>
            {links.map((el) => (
              <li key={`nav-drawer-${el.key}`}>
                <Link
                  href={el.link}
                  onClick={closeDrawer}
                  aria-current={isActive(el.link) ? 'page' : undefined}
                  className={`flex items-center justify-between py-4 font-display text-3xl border-b border-stone-100 transition-colors duration-300 ease-refined ${
                    isActive(el.link)
                      ? 'text-brand-green-ink'
                      : 'text-stone-900 hover:text-brand-green'
                  }`}
                >
                  {t(`nav.${el.key}`)}
                  {isActive(el.link) && <span className="w-6 h-px bg-brand-gold" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 px-5 pb-6">
            <button
              type="button"
              onClick={() => {
                closeDrawer();
                handleOpenModal();
              }}
              className="eyebrow w-full bg-brand-green-deep text-white py-3.5 hover:bg-brand-green-ink transition-colors duration-300 ease-refined"
            >
              {t('nav.contactForm')}
            </button>
            <Link
              href="/#availability"
              onClick={closeDrawer}
              className="eyebrow w-full text-center text-stone-700 border border-stone-300 py-3.5 hover:border-brand-green hover:text-brand-green transition-colors duration-300 ease-refined"
            >
              {t('nav.contactUs')}
            </Link>
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDrawer}
              className="eyebrow w-full inline-flex items-center justify-center gap-2 text-brand-green-deep border border-brand-green/40 py-3.5 hover:bg-brand-green hover:border-brand-green hover:text-white transition-colors duration-300 ease-refined"
            >
              <WhatsAppIcon fontSize="small" />
              {t('whatsapp.chat')}
            </a>
          </div>

          <div className="mt-auto px-5 pb-6 pt-4 border-t border-stone-200">
            <span className="eyebrow block mb-3 text-stone-500">{t('nav.language')}</span>
            <LanguageSwitcher variant="inline" onSelect={closeDrawer} />
          </div>
        </div>
      </Drawer>
    </Section>
  );
};
