/**
 * Twitter card image — uses the same render as the OG image so previews
 * are consistent across platforms. Twitter's `summary_large_image` card
 * crops to ~2:1 but our 1200x630 fits cleanly.
 */
export { default, alt, size, contentType } from './opengraph-image';
