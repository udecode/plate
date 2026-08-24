import type { Route } from 'next';
import type { LinkProps } from 'next/link';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

export function hrefWithLocale(href: string, locale: string): Route;
export function hrefWithLocale(href: string, locale: string): string {
  if (
    locale !== 'cn' ||
    href.startsWith('/cn') ||
    href.startsWith('#') ||
    ABSOLUTE_HREF_REGEX.test(href)
  ) {
    return href;
  }

  if (href === '/') {
    return '/cn';
  }

  return `/cn${href}`;
}

export const toLinkHref = (href: string): LinkProps<string>['href'] => {
  if (ABSOLUTE_HREF_REGEX.test(href)) return new URL(href);
  if (href.startsWith('#')) return { hash: href.slice(1) };
  if (href.startsWith('?')) return { search: href.slice(1) };

  return { pathname: href };
};
