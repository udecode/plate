import { useSearchParams } from 'next/navigation';

export const useLocale = () => {
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';

  return locale;
};

export const getLocalizedPath = (locale: string, href: string) =>
  locale === 'cn' || locale === 'pt-br'
    ? `/${locale}${href}?locale=${locale}`
    : href;
