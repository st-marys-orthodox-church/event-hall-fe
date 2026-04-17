# Component Guide

Reference for using and extending the UI component library. Read this before building a new section or page.

## Layout components

### `<Template>`

`src/ui/base/Template.tsx`

Full-page shell. Wraps every page. Renders the sticky Navbar and Footer.

```tsx
<Template>
  {/* page content */}
</Template>

// For inner pages where the fixed Navbar would overlap content:
<Template topPad>
  {/* page content */}
</Template>
```

**Props:** `topPad?: boolean` — adds a spacer div matching Navbar height.

---

### `<Section>`

`src/ui/layout/Section.tsx`

Content container: `max-w-screen-lg mx-auto px-3`. The standard horizontal constraint for all page content.

```tsx
<Section>
  {/* content */}
</Section>

// With centered title block:
<Section title="Our Packages" description="Choose what works for you.">
  {/* content */}
</Section>

// Custom vertical padding:
<Section yPadding="py-16">

// Full-bleed (override max-width — rarely needed):
<Section className="!max-w-none !px-0">
```

**Props:** `title?`, `description?`, `yPadding?` (default `"py-8"`), `className?`, `children`.

---

### `<CenteredSection>`

`src/ui/layout/CenteredSection.tsx`

Centered variant of Section with built-in text-center. Use for sections with a title + centered content grid.

---

### `<VerticalFeatureRow>`

`src/ui/layout/VerticalFeatureRow.tsx`

Two-column image + text layout with scroll-in animation. Used in the "Our Story" / "About" section.

```tsx
<VerticalFeatureRow
  title="Our Story"
  description={<p>...</p>}
  image="/photos/about-1.jpeg"
  imageAlt="Interior of Fellowship Event Hall"
/>

// Image on the right, text on the left:
<VerticalFeatureRow ... reverse />
```

**Props:** `title`, `description: string | ReactNode`, `image`, `imageAlt`, `reverse?: boolean`.

---

## Feature components

### `<Banner>`

`src/ui/features/Banner.tsx`

CTA strip. Two modes:

**Default (no children):** renders "Interested in booking?" + Contact button.

```tsx
<Banner />
```

**Custom content:**

```tsx
<Banner className="bg-gradient-to-r from-[#7c9885] to-[#9db5a0] rounded-3xl">
  <div className="text-center text-white">...</div>
</Banner>

// Full-bleed (edge-to-edge, no rounded corners):
<Banner full className="bg-stone-100">
  ...
</Banner>
```

**Props:** `full?: boolean`, `color?: string`, `className?: string`, `children?: ReactNode`.

---

### `<Hero>`

`src/ui/features/Hero.tsx`

Full-viewport hero with background carousel, overlay, headline, and CTA buttons. Statically defined — edit directly for copy changes.

---

### `<PackagesShowcase>`

`src/ui/features/PackagesShowcase.tsx`

Card grid displaying event packages. Accepts `title`, `description`, and a `packages` array.

---

### `<VerticalFeatures>`

`src/ui/features/VerticalFeatures.tsx`

"Our Story" / "It's All About You" section. Statically defined — edit directly for copy changes.

---

### `<FilteredGallery>`

`src/ui/features/FilteredGallery.tsx`

Photo gallery with category filters. Uses `react-photo-gallery` + `react-images` (lightbox).

```tsx
<FilteredGallery
  title="Our Gallery"
  description="Explore photos from past events"
  images={GALLERY_PHOTOS}
/>
```

Photos are defined in `src/utils/Photos.ts`.

---

## Small components

### `<ModernButton>`

`src/ui/components/ModernButton.tsx`

Branded MUI Button. The standard CTA button across the site.

```tsx
// Basic:
<ModernButton buttonVariant="primary" onClick={handler}>Book Now</ModernButton>

// As a navigation link (preferred over wrapping in <Link>):
<ModernButton component={Link} href="/packages" buttonVariant="primary">
  View Packages
</ModernButton>

// Large secondary CTA:
<ModernButton buttonVariant="secondary" size="large">Get a Quote</ModernButton>
```

**`buttonVariant`:** `primary` | `secondary` | `outline` | `outlineLight` | `ghost`
**`size`:** `small` | `medium` (default) | `large`

All other MUI `ButtonProps` are passed through (`onClick`, `disabled`, `component`, `href`, etc.).

---

### `<NumberDisplay>`

`src/ui/components/NumberDisplay.tsx`

Stat card: icon + label + large number value.

```tsx
<NumberDisplay
  text="Guest Capacity"
  value="300"
  icon={<People fontSize="large" className="text-[#7c9885]" />}
/>
```

**Props:** `text`, `value: string | number`, `icon?: ReactNode`.

---

### `<WhatsAppButton>`

`src/ui/components/WhatsAppButton.tsx`

Pre-configured WhatsApp CTA. Opens a WhatsApp chat with a pre-filled message based on event type.

```tsx
import { EVENT_TYPES } from '../../utils/Constants';

<WhatsAppButton eventType={EVENT_TYPES.WEDDING} size="medium">
  Wedding Quote
</WhatsAppButton>

<WhatsAppButton eventType={EVENT_TYPES.CORPORATE} variant="outlined">
  Corporate Quote
</WhatsAppButton>
```

**Props:** `eventType: string`, `size?`, `variant?`, `className?`, `children`.

---

### `<FadeIn>`

`src/ui/components/FadeIn.tsx`

Simple fade-in on mount. Used in Hero.

---

### `<HeroCarousel>`

`src/ui/components/HeroCarousel.tsx`

Auto-playing background image carousel. Used only in Hero — no external props.

---

## Base / chrome

### `<Meta>`

`src/ui/base/Meta.tsx`

Required on every page. Renders `<head>` tags, Next SEO, and JSON-LD structured data.

```tsx
import { Meta } from '../ui/base/Meta';
import { localBusinessJsonLd, eventVenueJsonLd } from '../utils/StructuredData';

<Meta
  title="Fellowship Event Hall — Weddings & Events in Dacula, GA"
  description="Book your event at Fellowship Event Hall in Dacula, GA. Up to 300 guests. Starting at $2,000. Tables, chairs, and coordinator included."
  jsonLd={[localBusinessJsonLd(), eventVenueJsonLd()]}
/>
```

`canonical` defaults to the current page URL — only override if you have a specific reason.

---

### `<Navbar>` / `<Footer>` / `<Logo>`

These are rendered by `<Template>` — do not instantiate directly on pages.

---

## Structured data helpers

`src/utils/StructuredData.ts`

```ts
localBusinessJsonLd()    // LocalBusiness schema — use on homepage
eventVenueJsonLd()       // EventVenue schema — use on homepage
offerCatalogJsonLd(offers)  // OfferCatalog + Offer schemas — use on packages/index pages
breadcrumbJsonLd(items)     // BreadcrumbList — use on inner pages
```

Always import from `StructuredData.ts` — do not write raw JSON-LD inline.

---

## Global state

`src/stores/Global.tsx`

```tsx
import { useAppContext } from '../stores/Global';
const { handleOpenModal } = useAppContext();

// Opens the contact modal:
<Button onClick={handleOpenModal}>Contact Us</Button>
```

`handleOpenModal` is the only exported action. The contact modal (`src/ui/modals/Contact.tsx`) is mounted globally in `_app.tsx`.
