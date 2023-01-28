import { Section } from '../layout/Section';
import { VerticalFeatureRow } from '../layout/VerticalFeatureRow';

const VerticalFeatures = () => (
  <Section yPadding='pt-4 pb-8'>
    <VerticalFeatureRow
      title="Your title here"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum, nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim."
      image="/photos/about-1.jpeg"
      imageAlt="First feature alt text"
    />
    <VerticalFeatureRow
      title="Your title here"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse bibendum, nunc non posuere consectetur, justo erat semper enim, non hendrerit dui odio id enim."
      image="/photos/about-2.jpeg"
      imageAlt="Second feature alt text"
      reverse
    />
  </Section>
);

export { VerticalFeatures };
