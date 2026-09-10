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
