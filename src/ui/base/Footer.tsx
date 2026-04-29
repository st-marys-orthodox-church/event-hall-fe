import { Facebook, Instagram, WhatsApp } from '@mui/icons-material';
import { useTranslation } from 'next-i18next/pages';
import Link from 'next/link';
import { SOCIALS, generateWhatsAppUrl } from '../../utils/Constants';
import { Section } from '../layout/Section';
import { Logo } from './Logo';

const Footer = () => {
  const { t } = useTranslation('common');
  return (
    <div className="bg-stone-900 text-stone-300 border-t border-brand-gold/30">
      <Section yPadding="py-12">
        <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <iframe
              title={t('footer.mapTitle')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.011264241855!2d-83.88655118493534!3d33.99224442833723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f5c1a9ba4ae061%3A0xf08756a1f5a18394!2sSaint%20Mary&#39;s%20Fellowship%20Hall%2F%20Sala%20Sociala%20Sfanta%20Maria!5e0!3m2!1sen!2sus!4v1678425858519!5m2!1sen!2sus"
              className="w-full max-w-[400px] h-[250px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-col items-center md:items-end justify-between gap-4 mt-4">
            <Logo />
            <div className="flex flex-col items-center md:items-end gap-3">
              <span className="eyebrow text-brand-gold">{t('footer.connect')}</span>
              <div className="flex flex-wrap justify-center md:justify-start md:flex-col items-center md:items-end gap-4 md:gap-2">
                <Link
                  href={SOCIALS.FB}
                  target="_blank"
                  className="hover:text-brand-gold transition-colors duration-300 text-sm inline-flex items-center gap-2"
                >
                  <Facebook fontSize="small" /> {t('footer.facebook')}
                </Link>

                <Link
                  href={SOCIALS.IG}
                  target="_blank"
                  className="hover:text-brand-gold transition-colors duration-300 text-sm inline-flex items-center gap-2"
                >
                  <Instagram fontSize="small" /> {t('footer.instagram')}
                </Link>

                <Link
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  className="hover:text-brand-gold transition-colors duration-300 text-sm text-brand-green inline-flex items-center gap-2"
                >
                  <WhatsApp fontSize="small" /> {t('footer.whatsapp')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export { Footer };
