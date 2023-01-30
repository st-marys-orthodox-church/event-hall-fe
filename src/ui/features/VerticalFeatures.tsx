import { Section } from '../layout/Section';
import { VerticalFeatureRow } from '../layout/VerticalFeatureRow';

const VerticalFeatures = () => (
  <Section yPadding='pt-4 pb-8'>
    <VerticalFeatureRow
      title="It's all about you"
      description="No matter the occasion, make it special. We're here to accomodate to any and all of your needs at any hour of the day. Let's make your next event a unique and memorable experience for you and your guests."
      image="/photos/about-1.jpeg"
      imageAlt="First feature alt text"
    />
    <VerticalFeatureRow
      title="It's all about you"
      description="No matter the occasion, make it special. We're here to accomodate to any and all of your needs at any hour of the day. Let's make your next event a unique and memorable experience for you and your guests."
      image="/photos/about-2.jpeg"
      imageAlt="Second feature alt text"
      reverse
    />
  </Section>
);

export { VerticalFeatures };
