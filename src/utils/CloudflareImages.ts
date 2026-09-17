const CF_IMAGE_HOST = 'imagedelivery.net';

/**
 * Cloudflare serves every image through a named variant. `public` is capped at
 * 768px on the long edge, so full-bleed art (sizes="100vw") and the gallery use
 * `full`, a scale-down variant of 2400x1600 defined in the Images dashboard.
 */
export const CF_FULL_BLEED_VARIANT = 'full';

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
