import type { Route } from 'next';
import type { LinkProps } from 'next/link';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;
const CN_HOME_OR_DOCS_REGEX = /^\/(?:docs)?(?:[/?#]|$)/;

export const hasCnPage = (href: string) => CN_HOME_OR_DOCS_REGEX.test(href);

export function hrefWithLocale(href: string, locale: string): Route;
export function hrefWithLocale(href: string, locale: string): string {
  if (locale !== 'cn' || !hasCnPage(href)) return href;

  return href === '/' ? '/cn' : `/cn${href}`;
}

export const toLinkHref = (href: string): LinkProps<string>['href'] => {
  if (ABSOLUTE_HREF_REGEX.test(href)) return new URL(href);
  if (href.startsWith('#')) return { hash: href.slice(1) };
  if (href.startsWith('?')) return { search: href.slice(1) };

  return { pathname: href };
};
