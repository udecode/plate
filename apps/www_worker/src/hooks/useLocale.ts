import { usePathname } from 'next/navigation';

export const useLocale = () => {
  const pathname = usePathname();

  return pathname?.startsWith('/cn') ? 'cn' : 'en';
};

export const getLocalizedPath = (locale: string, href: string) =>
  locale === 'cn' ? `/cn${href}` : href;
