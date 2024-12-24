export const hrefWithLocale = (href: string, locale: string) => {
  return `${href}${locale === 'en' ? '' : `?locale=${locale}`}`;
};
