/**
 * If href starts with '#'.
 */
export const isHtmlFragmentHref = (href: string): boolean =>
  href.startsWith('#');
