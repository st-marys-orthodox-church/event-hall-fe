import LanguageIcon from '@mui/icons-material/Language';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next/pages';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropdown } from '../../hooks';
import { COLORS } from '../../utils/DesignTokens';
import { I18N_DEFAULT_LOCALE, I18N_LOCALES } from '../../utils/i18nConfig';

const LOCALE_SHORT: Record<string, string> = {
  en: 'EN',
  es: 'ES',
  ro: 'RO',
};

type ILanguageSwitcherProps = {
  size?: 'small' | 'medium';
  variant?: 'menu' | 'inline';
  onSelect?: () => void;
};

export const LanguageSwitcher = ({
  size = 'small',
  variant = 'menu',
  onSelect,
}: ILanguageSwitcherProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { open, handleClick, handleClose, anchorEl } = useDropdown();
  const currentLocale = router.locale ?? I18N_DEFAULT_LOCALE;
  const locales = I18N_LOCALES;
  const currentShort = LOCALE_SHORT[currentLocale] ?? currentLocale.toUpperCase();

  if (variant === 'inline') {
    return (
      <nav aria-label={t('nav.language')} className="grid grid-cols-3 border border-stone-200">
        {locales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <Link
              key={locale}
              href={router.asPath}
              locale={locale}
              scroll={false}
              onClick={onSelect}
              aria-current={isActive ? 'true' : undefined}
              className={`flex flex-col items-center justify-center gap-1 py-3 border-r border-stone-200 last:border-r-0 transition-colors duration-300 ease-refined ${
                isActive
                  ? 'bg-brand-green-deep text-white'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <span className="eyebrow">{LOCALE_SHORT[locale] ?? locale.toUpperCase()}</span>
              <span className="text-xs">{t(`nav.languageNames.${locale}`)}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <Tooltip title={t('nav.language')}>
        <IconButton
          onClick={handleClick}
          size={size}
          aria-label={`${t('nav.language')}: ${currentShort}`}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            borderRadius: 0,
            color: COLORS.brand.greenInk,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            px: 1,
          }}
        >
          <LanguageIcon fontSize={size} />
          <span
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {currentShort}
          </span>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
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
              minWidth: 160,
            },
          },
        }}
      >
        {locales.map((locale) => (
          <MenuItem
            key={locale}
            component={Link}
            href={router.asPath}
            locale={locale}
            scroll={false}
            onClick={handleClose}
            selected={locale === currentLocale}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: '0.75rem',
              color: locale === currentLocale ? COLORS.brand.greenDeep : COLORS.neutral.mutedText,
              py: 1.25,
            }}
          >
            {t(`nav.languageNames.${locale}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
