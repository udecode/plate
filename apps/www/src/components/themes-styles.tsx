'use client';

import { useConfig } from '@/hooks/use-config';
import { useThemesConfig } from '@/hooks/use-themes-config';
import { useMounted } from '@/registry/default/hooks/use-mounted';

export function ThemesStyle() {
  const [config] = useConfig();
  const { themesConfig } = useThemesConfig();
  const mounted = useMounted();

  if (!themesConfig.activeTheme || !mounted) {
    return null;
  }

  return (
    <style>
      {`
.themes-wrapper,
[data-chart] {
  ${Object.entries(themesConfig.activeTheme.cssVars.light)
    .map(([key, value]) => `${key}: hsl(${value});`)
    .join('\n')}
  --radius: ${config.radius}rem;
}

.dark .themes-wrapper,
.dark [data-chart] {
  ${Object.entries(themesConfig.activeTheme.cssVars.dark)
    .map(([key, value]) => `${key}: hsl(${value});`)
    .join('\n')}
  --radius: ${config.radius}rem;
}
  `}
    </style>
  );
}
