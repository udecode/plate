export const hrefWithLocale = (href: string, locale: string) => {
  if (locale === 'cn') {
    return `/cn${href}`;
  }

  return href;
};
