import { Section } from '../layout/Section';
import { VerticalFeatureRow } from '../layout/VerticalFeatureRow';

const VerticalFeatures = () => (
  <Section yPadding="pt-4 pb-8">
    <VerticalFeatureRow
      title="Our Story"
      description={
        <>
          <p>
            Saint Mary’s Fellowship Hall in Dacula is a brand-new facility and event venue that
            belongs to the Saint Mary’s Church serving American-Romanian community in the area.
          </p>
          <br />
          <p>
            The property is an expression of our identity, a fingerprint of our presence in the area
            and our contribution to Gwinnett’s multi-cultural society. It is also an expression of
            our community at its best, through the sacrifice and dedication of a small but very
            active group of members.
          </p>
        </>
      }
      image="/photos/about-1.jpeg"
      imageAlt="Interior of Fellowship Event Hall in Dacula, GA with tables set for a wedding reception"
    />
    <VerticalFeatureRow
      title="It's All About You"
      description={
        <>
          <p>
            Our renting facility stands out in the area with a new and large parking space,
            beautiful green space around, privacy for your events, flexible hours, brand new
            building with modern design and multiple options for decorations.
          </p>
          <br />
          <p>It is an expression of our hospitality and a place you will feel welcomed.</p>
        </>
      }
      image="/photos/about-2.jpg"
      imageAlt="Exterior view of Fellowship Event Hall showing landscaped grounds and on-site parking"
      reverse
    />
  </Section>
);

export { VerticalFeatures };
