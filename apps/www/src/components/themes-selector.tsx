'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';

import { useMediaQuery } from '@/hooks/use-media-query';
import { useThemesConfig } from '@/hooks/use-themes-config';
import { type Theme, THEME_LIST } from '@/lib/themes';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { cn } from '@/registry/default/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

import { Skeleton } from './ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function ThemesSwitcher({
  className,
  themes = THEME_LIST,
}: React.ComponentProps<'div'> & { themes?: Theme[] }) {
  const { theme: mode } = useTheme();
  const mounted = useMounted();
  const { setThemesConfig, themesConfig } = useThemesConfig();
  const activeTheme = themesConfig.activeTheme;
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-0.5 py-2 lg:flex-col lg:justify-start lg:gap-1',
          className
        )}
      >
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="flex size-10 items-center justify-center rounded-lg border-2 border-transparent"
          >
            <Skeleton className="size-6 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ToggleGroup
      className={cn(
        'flex items-center justify-center gap-0.5 py-2 lg:flex-col lg:justify-start lg:gap-1',
        className
      )}
      value={activeTheme.name}
      onValueChange={(value) => {
        const theme = themes.find((theme) => theme.name === value);

        if (!theme) {
          return;
        }

        setThemesConfig({ ...themesConfig, activeTheme: theme });
      }}
      type="single"
    >
      <TooltipProvider>
        {themes.map((theme) => {
          const isActive = theme.name === activeTheme.name;
          const isDarkTheme = ['Midnight'].includes(theme.name);
          const cssVars =
            mounted && mode === 'dark'
              ? theme.cssVars.dark
              : theme.cssVars.light;

          return (
            <Tooltip key={theme.name}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  className={cn(
                    'group flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-transparent p-0 hover:bg-transparent focus-visible:bg-transparent aria-checked:border-[--color-1]',
                    mounted && isDarkTheme && mode !== 'dark'
                      ? 'invert-[1]'
                      : ''
                  )}
                  style={
                    {
                      ...cssVars,
                      '--color-1': 'hsl(var(--chart-1))',
                      '--color-2': 'hsl(var(--chart-2))',
                      '--color-3': 'hsl(var(--chart-3))',
                      '--color-4': 'hsl(var(--chart-4))',
                    } as React.CSSProperties
                  }
                  value={theme.name}
                >
                  <div className="size-6 overflow-hidden rounded-sm">
                    <div
                      className={cn(
                        'grid size-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out group-hover:rotate-45',
                        isActive ? 'rotate-45 group-hover:rotate-0' : 'rotate-0'
                      )}
                    >
                      <span className="flex size-6 bg-[--color-1]" />
                      <span className="flex size-6 bg-[--color-2]" />
                      <span className="flex size-6 bg-[--color-3]" />
                      <span className="flex size-6 bg-[--color-4]" />
                      <span className="sr-only">{theme.name}</span>
                    </div>
                  </div>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent
                className="bg-black text-white"
                side={isDesktop ? 'left' : 'top'}
              >
                {theme.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </ToggleGroup>
  );
}
