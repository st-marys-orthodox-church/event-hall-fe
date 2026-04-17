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
};

export const LanguageSwitcher = ({ size = 'small' }: ILanguageSwitcherProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { open, handleClick, handleClose, anchorEl } = useDropdown();
  const currentLocale = router.locale ?? I18N_DEFAULT_LOCALE;
  const locales = I18N_LOCALES;

  return (
    <>
      <Tooltip title={t('nav.language')}>
        <IconButton
          onClick={handleClick}
          size={size}
          aria-label={t('nav.language')}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            borderRadius: 0,
            color: COLORS.brand.green,
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
            {LOCALE_SHORT[currentLocale] ?? currentLocale.toUpperCase()}
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
              color: locale === currentLocale ? COLORS.brand.green : COLORS.neutral.mutedText,
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
