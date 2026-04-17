import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import { useWindowSize } from '../../hooks';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const { isMobile } = useWindowSize();
  const { t } = useTranslation('common');
  const fontStyle = props.xl ? 'font-semibold text-2xl' : 'font-semibold text-xl';
  const [width, height] = props.xl ? [200, 33] : [170, 28];

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src={isMobile ? '/logos/fellowship-logomark.svg' : '/logos/fellowship-wordmark.svg'}
        alt={t('logo.alt')}
        width={isMobile ? 30 : width}
        height={isMobile ? 30 : height}
        priority
      />
    </span>
  );
};

export { Logo };
