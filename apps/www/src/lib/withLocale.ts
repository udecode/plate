import type { Route } from 'next';
import type { LinkProps } from 'next/link';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

export const hrefWithLocale = (href: string, locale: string): Route => {
  if (
    locale !== 'cn' ||
    href.startsWith('/cn') ||
    href.startsWith('#') ||
    ABSOLUTE_HREF_REGEX.test(href)
  ) {
    return href as Route;
  }

  if (href === '/') {
    return '/cn';
  }

  return `/cn${href}` as Route;
};

export const toLinkHref = (href: string): LinkProps<string>['href'] => {
  if (ABSOLUTE_HREF_REGEX.test(href)) return new URL(href);
  if (href.startsWith('#')) return { hash: href.slice(1) };
  if (href.startsWith('?')) return { search: href.slice(1) };

  return { pathname: href };
};
