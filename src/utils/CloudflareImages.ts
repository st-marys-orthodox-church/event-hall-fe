const CF_IMAGE_HOST = 'imagedelivery.net';

/**
 * Cloudflare serves every image through a named variant, and `public` is capped
 * at 768px on the long edge. Full-bleed art requests `sizes="100vw"`, so
 * next/image upscales that source on any large display. Point this at a wider
 * variant once the account has one — either a named variant, or a flexible
 * variant such as `w=2400,q=85` (needs Flexible Variants enabled in Images).
 */
export const CF_FULL_BLEED_VARIANT = 'public';

export const cfVariant = (src: string, variant: string) =>
  src.includes(CF_IMAGE_HOST) ? src.replace(/\/[^/]+$/, `/${variant}`) : src;

export const fullBleedSrc = (src: string) => cfVariant(src, CF_FULL_BLEED_VARIANT);

/** Widths Next's image optimizer will serve; must be a subset of images.deviceSizes. */
const OPTIMIZER_WIDTHS = [640, 828, 1080, 1200, 1920];

/**
 * Builds a srcset that routes a remote image through /_next/image so the
 * browser gets a right-sized WebP instead of the full Cloudflare variant.
 */
export const optimizedSrcSet = (src: string, width: number, height: number) =>
  OPTIMIZER_WIDTHS.filter((w) => w <= width).map((w) => ({
    src: `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`,
    width: w,
    height: Math.round((height * w) / width),
  }));
