import { Section } from '../layout/Section';
import { VerticalFeatureRow } from '../layout/VerticalFeatureRow';

const VerticalFeatures = () => (
  <Section yPadding='pt-4 pb-8'>
    <VerticalFeatureRow
      title="Our Story"
      description={
        <>
        <p>Saint Mary’s Fellowship Hall in Dacula is a brand-new facility and event venue that belongs to the Saint
Mary’s Church serving American-Romanian community in the area.</p>
        <br />
        <p>The property is an expression of our identity, a fingerprint of our presence in the area and our
contribution to Gwinnett’s multi-cultural society. It is also an expression of our community at its best,
through the sacrifice and dedication of a small but very active group of members.</p>
        <br />
        <p>Very carefully selected, designed, and executed, this facility is our gift to future generations. It is a place
for important events that will create memories, a place to remember, a place that brings a good vibe to
the soul once you have experienced its uniqueness and charm.</p>
        </>
      }
      image="/photos/about-1.jpeg"
      imageAlt="First feature alt text"
    />
    <VerticalFeatureRow
      title="It's All About You"
      description={
        <>
        <p>
        Renting this facility for your events makes us responsible and committed to have you in our “Home”.
You will be treated with special care and with very professional courtesy. Our agreements and set of
rules are made to avoid any complications and unpleasant situations.
        </p>
        <br />
        <p>
        Our renting facility stands out in the area with a new and large parking space, beautiful green space
around, privacy for your events, flexible hours, brand new building with modern design and multiple
options for decorations.
        </p>
        <br />
        <p>
        It is an expression of our hospitality and a place you will feel welcomed.
        </p>
        </>
      }
      image="/photos/about-2.jpeg"
      imageAlt="Second feature alt text"
      reverse
    />
  </Section>
);

export { VerticalFeatures };
