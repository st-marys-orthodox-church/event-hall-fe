import { useTranslation } from 'next-i18next/pages';
import { STORY_FEATURES } from '../../utils/Features';
import { Section } from '../layout/Section';
import { VerticalFeatureRow } from '../layout/VerticalFeatureRow';

const VerticalFeatures = () => {
  const { t } = useTranslation('home');
  return (
    <Section yPadding="pt-4 pb-12">
      {STORY_FEATURES.map((feature) => {
        const paragraphs = t(`story.${feature.key}.paragraphs`, {
          returnObjects: true,
        }) as string[];
        return (
          <VerticalFeatureRow
            key={feature.key}
            eyebrow={t('story.eyebrow')}
            title={t(`story.${feature.key}.title`)}
            paragraphs={paragraphs}
            image={feature.image}
            imageAlt={t(`story.${feature.key}.imageAlt`)}
            reverse={feature.reverse}
          />
        );
      })}
    </Section>
  );
};

export { VerticalFeatures };
