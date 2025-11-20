import { useSearchParams } from 'next/navigation';

export const useLocale = () => {
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';

  return locale;
};

export const getLocalizedPath = (locale: string, href: string) =>
  locale === 'cn' ? `/cn${href}?locale=cn` : href;
