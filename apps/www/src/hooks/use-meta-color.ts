import { useTheme } from 'next-themes';

import { META_THEME_COLORS } from '@/config/site';

const setMetaColor = (color: string) => {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', color);
};

export function useMetaColor() {
  const { resolvedTheme } = useTheme();
  const metaColor =
    resolvedTheme === 'dark' ? META_THEME_COLORS.dark : META_THEME_COLORS.light;

  return {
    metaColor,
    setMetaColor,
  };
}
