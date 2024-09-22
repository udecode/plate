'use client';

import { useConfig } from '@/hooks/use-config';
import { useMounted } from '@/hooks/use-mounted';
import { useThemesConfig } from '@/hooks/use-themes-config';

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
.themes-wrapper, [role="toolbar"], [data-radix-popper-content-wrapper]>div, [data-dialog], [data-popover] {
  ${Object.entries(themesConfig.activeTheme.cssVars.light)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')}
  --radius: ${config.radius}rem;
}

.dark .themes-wrapper, .dark [role="toolbar"], .dark [data-radix-popper-content-wrapper]>div, .dark [data-dialog], .dark [data-popover] {
  ${Object.entries(themesConfig.activeTheme.cssVars.dark)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')}
  --radius: ${config.radius}rem;
}
  `}
    </style>
  );
}
