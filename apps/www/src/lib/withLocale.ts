const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

export const hrefWithLocale = (href: string, locale: string) => {
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
};
