import { useSearchParams } from 'next/navigation';

export const useLocale = () => {
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';

  return locale;
};
