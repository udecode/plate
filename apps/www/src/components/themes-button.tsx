'use client';

import * as React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';
import { Paintbrush } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useConfig } from '@/hooks/use-config';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';
import { themes } from '@/registry/themes';

import { settingsStore } from './context/settings-store';
import { Skeleton } from './ui/skeleton';

export function ThemesButton() {
  const [config, setConfig] = useConfig();
  const { resolvedTheme: mode } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center">
      <div className="mr-2 flex items-center space-x-0.5">
        {mounted ? (
          <>
            {['slate', 'rose', 'blue', 'green', 'orange'].map((color) => {
              const theme = themes.find((th) => th.name === color);
              const isActive = config.theme === color;

              if (!theme) {
                return null;
              }

              return (
                <Tooltip key={theme.name}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          theme: theme.name,
                        })
                      }
                      className={cn(
                        'flex size-9 items-center justify-center rounded-full border-2 text-xs',
                        isActive
                          ? 'border-[--theme-primary]'
                          : 'border-transparent'
                      )}
                      style={
                        {
                          '--theme-primary': `hsl(${
                            theme?.activeColor[
                              mode === 'dark' ? 'dark' : 'light'
                            ]
                          })`,
                        } as React.CSSProperties
                      }
                    >
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full bg-[--theme-primary]'
                        )}
                      >
                        {isActive && (
                          <CheckIcon className="size-4 text-white" />
                        )}
                      </span>
                      <span className="sr-only">{theme.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    align="center"
                    className="rounded-[0.5rem] bg-slate-900 text-slate-50"
                  >
                    {theme.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </>
        ) : (
          <div className="mr-1 flex items-center space-x-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => {
          settingsStore.set.customizerTab('themes');
          settingsStore.set.showSettings(true);
        }}
      >
        <Paintbrush className="mr-2 size-4" />
        Themes
      </Button>
    </div>
  );
}
