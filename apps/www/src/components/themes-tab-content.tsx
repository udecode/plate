'use client';

import * as React from 'react';
import {
  CheckIcon,
  InfoCircledIcon,
  MoonIcon,
  ResetIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
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
  const { setTheme: setMode, resolvedTheme: mode } = useTheme();

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

        <CopyCodeButton />
      </div>
      <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
        <div className="space-y-1.5">
          <div className="flex w-full items-center">
            <Label className="text-xs">Style</Label>
            <Popover>
              <PopoverTrigger>
                <InfoCircledIcon className="ml-1 h-3 w-3" />
                <span className="sr-only">About styles</span>
              </PopoverTrigger>
              <PopoverContent
                className="space-y-3 rounded-[0.5rem] text-sm"
                side="right"
                align="start"
                alignOffset={-20}
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
              variant="outline"
              size="sm"
              onClick={() => setConfig({ ...config, style: 'default' })}
              className={cn(
                config.style === 'default' && 'border-2 border-primary'
              )}
            >
              Default
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto rounded-[0.5rem]"
              onClick={() => {
                setConfig({
                  ...config,
                  theme: 'slate',
                  radius: 0.5,
                });
              }}
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
                  variant="outline"
                  size="sm"
                  key={theme.name}
                  onClick={() => {
                    setConfig({
                      ...config,
                      theme: theme.name,
                    });
                  }}
                  className={cn(
                    'justify-start',
                    isActive && 'border-2 border-primary'
                  )}
                  style={
                    {
                      '--theme-primary': `hsl(${theme?.activeColor[
                        mode === 'dark' ? 'dark' : 'light'
                      ]})`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={cn(
                      'mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]'
                    )}
                  >
                    {isActive && <CheckIcon className="h-4 w-4 text-white" />}
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
                  variant="outline"
                  size="sm"
                  key={value}
                  onClick={() => {
                    setConfig({
                      ...config,
                      radius: Number.parseFloat(value),
                    });
                  }}
                  className={cn(
                    config.radius === Number.parseFloat(value) &&
                      'border-2 border-primary'
                  )}
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
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('light')}
                  className={cn(mode === 'light' && 'border-2 border-primary')}
                >
                  <SunIcon className="mr-1 -translate-x-1" />
                  Light
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('dark')}
                  className={cn(mode === 'dark' && 'border-2 border-primary')}
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
