'use client';

import * as React from 'react';

import {
  InfoCircledIcon,
  MoonIcon,
  ResetIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';
import { useTheme } from 'next-themes';

import { useConfig } from '@/hooks/use-config';
import { useThemesConfig } from '@/hooks/use-themes-config';
import { THEMES } from '@/lib/themes';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';
import { Separator } from '@/registry/default/plate-ui/separator';

import { CopyCodeButton, getThemeCode } from './copy-code-button';
import { ThemesSwitcher } from './themes-selector-mini';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';

export function ThemeCustomizer() {
  const mounted = useMounted();
  const [config, setConfig] = useConfig();
  const { setThemesConfig, themesConfig } = useThemesConfig();
  const activeTheme = themesConfig.activeTheme ?? THEMES['default-shadcn'];
  const { resolvedTheme: mode, setTheme: setMode } = useTheme();

  const themeCode = React.useMemo(() => {
    return getThemeCode(activeTheme, config.radius);
  }, [activeTheme, config.radius]);

  return (
    <div className="flex h-full flex-col space-y-4 md:space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1 px-6 pr-2">
          <div className="font-semibold leading-none tracking-tight">
            Customize
          </div>
          <div className="text-xs text-muted-foreground">
            Pick a style and color for your components.
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="space-y-1.5 px-6">
          <div className="flex w-full items-center">
            <Label className="text-xs">Style</Label>
            <Popover>
              <PopoverTrigger>
                <InfoCircledIcon className="ml-1 size-3" />
                <span className="sr-only">About styles</span>
              </PopoverTrigger>
              <PopoverContent
                className="space-y-3 rounded-[0.5rem] text-sm"
                align="start"
                alignOffset={-20}
                side="right"
              >
                <p className="font-medium">What is a style?</p>
                <p>
                  A style comes with its own set of components, animations,
                  icons and more.
                </p>
                <p>
                  The <span className="font-medium">Default</span> style has
                  large inputs, uses lucide-react for icons and
                  tailwindcss-animate for animations.
                </p>
                <p>Other styles will be added in the future.</p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                config.style === 'default' && 'border-2 border-primary'
              )}
              onClick={() => setConfig({ ...config, style: 'default' })}
            >
              Default
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="ml-auto rounded-[0.5rem]"
              onClick={() => {
                setConfig({
                  radius: 0.5,
                  style: 'default',
                  theme: 'slate',
                });
                setThemesConfig({
                  activeTheme: THEMES['default-shadcn'],
                });
              }}
            >
              <ResetIcon />
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </div>
        <div className="space-y-1.5 px-6">
          <Label className="text-xs">Theme</Label>
          <ThemesSwitcher />
        </div>
        <div className="space-y-1.5 px-6">
          <Label className="text-xs">Radius</Label>
          <div className="grid grid-cols-5 gap-2">
            {['0', '0.3', '0.5', '0.75', '1.0'].map((value) => {
              return (
                <Button
                  key={value}
                  size="sm"
                  variant="outline"
                  className={cn(
                    config.radius === Number.parseFloat(value) &&
                      'border-2 border-primary'
                  )}
                  onClick={() => {
                    setConfig({
                      ...config,
                      radius: Number.parseFloat(value),
                    });
                  }}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1.5 px-6">
          <Label className="text-xs">Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {mounted ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(mode === 'light' && 'border-2 border-primary')}
                  onClick={() => setMode('light')}
                >
                  <SunIcon className="mr-1 -translate-x-1" />
                  Light
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(mode === 'dark' && 'border-2 border-primary')}
                  onClick={() => setMode('dark')}
                >
                  <MoonIcon className="mr-1 -translate-x-1" />
                  Dark
                </Button>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            )}
          </div>
        </div>

        <Separator className="w-full" />

        <div className="relative grow space-y-1.5 px-4">
          <div className="h-full flex-1 flex-col overflow-hidden data-[state=active]:flex">
            <div
              className="relative h-full overflow-auto rounded-lg bg-black py-6"
              data-rehype-pretty-code-fragment
            >
              <pre className="bg-black font-mono text-sm leading-relaxed">
                <code data-line-numbers="">
                  <span className="line text-zinc-700">{`/* ${themesConfig.activeTheme.name} */`}</span>
                  {themeCode.split('\n').map((line, index) => (
                    <span key={index} className="line">
                      {line}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
          <CopyCodeButton className="absolute right-4 top-4" compact />
        </div>
      </div>
    </div>
  );
}
