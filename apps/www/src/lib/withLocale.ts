export const hrefWithLocale = (href: string, locale: string) => {
  if (locale === 'cn' || locale === 'pt-br') {
    return `/${locale}${href}?locale=${locale}`;
  }

  return href;
};
