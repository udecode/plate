'use client';

import * as React from 'react';

import {
  CheckIcon,
  InfoCircledIcon,
  MoonIcon,
  ResetIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';
import { useTheme } from 'next-themes';

import { useConfig } from '@/hooks/use-config';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';
import { themes } from '@/registry/themes';

import { CopyCodeButton } from './copy-code-button';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';

export function ThemesTabContent() {
  const [mounted, setMounted] = React.useState(false);
  const [config, setConfig] = useConfig();
  const { resolvedTheme: mode, setTheme: setMode } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-1 pr-2">
          <div className="font-semibold leading-none tracking-tight">
            Customize
          </div>
          <div className="text-xs text-muted-foreground">
            Pick a style and color for your components.
          </div>
        </div>

        <CopyCodeButton className="[&_svg]:hidden" size="sm" variant="ghost" />
      </div>
      <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
        <div className="space-y-1.5">
          <div className="flex w-full items-center">
            <Label className="text-xs">Style</Label>
            <Popover>
              <PopoverTrigger>
                <InfoCircledIcon className="ml-1 size-3" />
                <span className="sr-only">About styles</span>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                alignOffset={-20}
                className="space-y-3 rounded-[0.5rem] text-sm"
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
              className={cn(
                config.style === 'default' && 'border-2 border-primary'
              )}
              onClick={() => setConfig({ ...config, style: 'default' })}
              size="sm"
              variant="outline"
            >
              Default
            </Button>

            <Button
              className="ml-auto rounded-[0.5rem]"
              onClick={() => {
                setConfig({
                  ...config,
                  radius: 0.5,
                  theme: 'slate',
                });
              }}
              size="icon"
              variant="ghost"
            >
              <ResetIcon />
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Color</Label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => {
              const isActive = config.theme === theme.name;

              return mounted ? (
                <Button
                  className={cn(
                    'justify-start',
                    isActive && 'border-2 border-primary'
                  )}
                  key={theme.name}
                  onClick={() => {
                    setConfig({
                      ...config,
                      theme: theme.name,
                    });
                  }}
                  size="sm"
                  style={
                    {
                      '--theme-primary': `hsl(${
                        theme?.activeColor[mode === 'dark' ? 'dark' : 'light']
                      })`,
                    } as React.CSSProperties
                  }
                  variant="outline"
                >
                  <span
                    className={cn(
                      'mr-1 flex size-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]'
                    )}
                  >
                    {isActive && <CheckIcon className="size-4 text-white" />}
                  </span>
                  {theme.label}
                </Button>
              ) : (
                <Skeleton className="h-8 w-full" key={theme.name} />
              );
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Radius</Label>
          <div className="grid grid-cols-5 gap-2">
            {['0', '0.3', '0.5', '0.75', '1.0'].map((value) => {
              return (
                <Button
                  className={cn(
                    config.radius === Number.parseFloat(value) &&
                      'border-2 border-primary'
                  )}
                  key={value}
                  onClick={() => {
                    setConfig({
                      ...config,
                      radius: Number.parseFloat(value),
                    });
                  }}
                  size="sm"
                  variant="outline"
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {mounted ? (
              <>
                <Button
                  className={cn(mode === 'light' && 'border-2 border-primary')}
                  onClick={() => setMode('light')}
                  size="sm"
                  variant="outline"
                >
                  <SunIcon className="mr-1 -translate-x-1" />
                  Light
                </Button>
                <Button
                  className={cn(mode === 'dark' && 'border-2 border-primary')}
                  onClick={() => setMode('dark')}
                  size="sm"
                  variant="outline"
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
      </div>
    </>
  );
}
