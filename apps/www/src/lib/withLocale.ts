export const hrefWithLocale = (href: string, locale: string) => {
  return `${locale === 'en' ? '' : `/cn`}${href}${locale === 'en' ? '' : `?locale=${locale}`}`;
};
