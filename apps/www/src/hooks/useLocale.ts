import { usePathname } from 'next/navigation';

import { hrefWithLocale } from '@/lib/withLocale';

export const useLocale = () => {
  const pathname = usePathname();

  return pathname?.startsWith('/cn') ? 'cn' : 'en';
};

export const getLocalizedPath = (locale: string, href: string) =>
  hrefWithLocale(href, locale);
