'use client';

import * as React from 'react';

import {
  CheckIcon,
  CopyIcon,
  InfoCircledIcon,
  MoonIcon,
  ResetIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';
import template from 'lodash.template';
import { useTheme } from 'next-themes';

import { useConfig } from '@/hooks/use-config';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/default/plate-ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';
import { type BaseColor, baseColors } from '@/registry/registry-base-colors';

import { copyToClipboardWithMeta } from './copy-button';
import { ThemeWrapper } from './theme-wrapper';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';

import '@/styles/mdx.css';

export function ThemeCustomizer() {
  const [config, setConfig] = useConfig();
  const { resolvedTheme: mode } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Drawer>
        <DrawerTrigger asChild>
          <Button size="sm" className="md:hidden">
            Customize
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-6 pt-0">
          <Customizer />
        </DrawerContent>
      </Drawer>
      <div className="hidden items-center md:flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm">Customize</Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-40 w-[340px] rounded-[12px] bg-white p-6 dark:bg-zinc-950"
            align="start"
          >
            <Customizer />
          </PopoverContent>
        </Popover>
        <div className="ml-2 hidden items-center gap-0.5">
          {mounted ? (
            <>
              {['zinc', 'rose', 'blue', 'green', 'orange'].map((color) => {
                const baseColor = baseColors.find(
                  (baseColor) => baseColor.name === color
                );
                const isActive = config.theme === color;

                if (!baseColor) {
                  return null;
                }

                return (
                  <Tooltip key={baseColor.name}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full border-2 text-xs',
                          isActive
                            ? 'border-[--theme-primary]'
                            : 'border-transparent'
                        )}
                        style={
                          {
                            '--theme-primary': `hsl(${
                              baseColor?.activeColor[
                                mode === 'dark' ? 'dark' : 'light'
                              ]
                            })`,
                          } as React.CSSProperties
                        }
                        onClick={() =>
                          setConfig({
                            ...config,
                            theme: baseColor.name,
                          })
                        }
                        type="button"
                      >
                        <span
                          className={cn(
                            'flex size-5 items-center justify-center rounded-full bg-[--theme-primary]'
                          )}
                        >
                          {isActive && (
                            <CheckIcon className="size-4 text-white" />
                          )}
                        </span>
                        <span className="sr-only">{baseColor.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="rounded-[0.5rem] bg-zinc-900 text-zinc-50"
                      align="center"
                    >
                      {baseColor.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </>
          ) : (
            <div className="mr-1 flex items-center gap-4">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
            </div>
          )}
        </div>
      </div>
      <CopyCodeButton size="sm" variant="ghost" className="[&_svg]:hidden" />
    </div>
  );
}

function Customizer() {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme: mode, setTheme: setMode } = useTheme();
  const [config, setConfig] = useConfig();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeWrapper
      className="flex flex-col space-y-4 md:space-y-6"
      defaultTheme="zinc"
    >
      <div className="flex items-start pt-4 md:pt-0">
        <div className="space-y-1 pr-2">
          <div className="font-semibold leading-none tracking-tight">
            Customize
          </div>
          <div className="text-xs text-muted-foreground">
            Pick a style and color for your components.
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="ml-auto rounded-[0.5rem]"
          onClick={() => {
            setConfig({
              ...config,
              radius: 0.5,
              theme: 'zinc',
            });
          }}
        >
          <ResetIcon />
          <span className="sr-only">Reset</span>
        </Button>
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
                className="space-y-3 rounded-[0.5rem] text-sm"
                align="start"
                alignOffset={-20}
                side="right"
              >
                <p className="font-medium">
                  What is the difference between the New York and Default style?
                </p>
                <p>
                  A style comes with its own set of components, animations,
                  icons and more.
                </p>
                <p>
                  The <span className="font-medium">Default</span> style has
                  larger inputs, uses lucide-react for icons and
                  tailwindcss-animate for animations.
                </p>
                <p>
                  The <span className="font-medium">New York</span> style ships
                  with smaller buttons and cards with shadows. It uses icons
                  from Radix Icons.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-3 gap-2">
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
            {/* <Button
              size="sm"
              variant="outline"
              className={cn(
                config.style === 'new-york' && 'border-2 border-primary'
              )}
              onClick={() => setConfig({ ...config, style: 'new-york' })}
            >
              New York
            </Button> */}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Color</Label>
          <div className="grid grid-cols-3 gap-2">
            {baseColors.map((theme) => {
              const isActive = config.theme === theme.name;

              return mounted ? (
                <Button
                  key={theme.name}
                  size="sm"
                  variant="outline"
                  className={cn(
                    'justify-start',
                    isActive && 'border-2 border-primary'
                  )}
                  style={
                    {
                      '--theme-primary': `hsl(${
                        theme?.activeColor[mode === 'dark' ? 'dark' : 'light']
                      })`,
                    } as React.CSSProperties
                  }
                  onClick={() => {
                    setConfig({
                      ...config,
                      theme: theme.name,
                    });
                  }}
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
                <Skeleton key={theme.name} className="h-8 w-full" />
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
        <div className="space-y-1.5">
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
      </div>
    </ThemeWrapper>
  );
}

function CopyCodeButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const [config] = useConfig();
  const activeTheme = baseColors.find((theme) => theme.name === config.theme);
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <>
      {activeTheme && (
        <Button
          className={cn('md:hidden', className)}
          onClick={() => {
            copyToClipboardWithMeta(getThemeCode(activeTheme, config.radius), {
              name: 'copy_theme_code',
              properties: {
                radius: config.radius,
                theme: activeTheme.name,
              },
            });
            setHasCopied(true);
          }}
          {...props}
        >
          {hasCopied ? (
            <CheckIcon className="mr-2 size-4" />
          ) : (
            <CopyIcon className="mr-2 size-4" />
          )}
          Copy code
        </Button>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button className={cn('hidden md:flex', className)} {...props}>
            Copy code
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl outline-none">
          <DialogHeader>
            <DialogTitle>Theme</DialogTitle>
            <DialogDescription>
              Copy and paste the following code into your CSS file.
            </DialogDescription>
          </DialogHeader>
          <ThemeWrapper className="relative" defaultTheme="zinc">
            <CustomizerCode />
            {activeTheme && (
              <Button
                size="sm"
                className="absolute right-4 top-4 bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                onClick={() => {
                  copyToClipboardWithMeta(
                    getThemeCode(activeTheme, config.radius),
                    {
                      name: 'copy_theme_code',
                      properties: {
                        radius: config.radius,
                        theme: activeTheme.name,
                      },
                    }
                  );
                  setHasCopied(true);
                }}
              >
                {hasCopied ? (
                  <CheckIcon className="mr-2 size-4" />
                ) : (
                  <CopyIcon className="mr-2 size-4" />
                )}
                Copy
              </Button>
            )}
          </ThemeWrapper>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CustomizerCode() {
  const [config] = useConfig();
  const activeTheme = baseColors.find((theme) => theme.name === config.theme);

  return (
    <ThemeWrapper className="relative space-y-4" defaultTheme="zinc">
      <div data-rehype-pretty-code-fragment="">
        <pre className="max-h-[450px] overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            <span className="line text-white">@layer base &#123;</span>
            <span className="line text-white">&nbsp;&nbsp;:root &#123;</span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--background:{' '}
              {activeTheme?.cssVars.light.background};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--foreground:{' '}
              {activeTheme?.cssVars.light.foreground};
            </span>
            {[
              'card',
              'popover',
              'primary',
              'secondary',
              'muted',
              'accent',
              'destructive',
            ].map((prefix) => (
              <>
                <span className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}:{' '}
                  {
                    activeTheme?.cssVars.light[
                      prefix as keyof typeof activeTheme.cssVars.light
                    ]
                  }
                  ;
                </span>
                <span className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}-foreground:{' '}
                  {
                    activeTheme?.cssVars.light[
                      `${prefix}-foreground` as keyof typeof activeTheme.cssVars.light
                    ]
                  }
                  ;
                </span>
              </>
            ))}
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--border:{' '}
              {activeTheme?.cssVars.light.border};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--input:{' '}
              {activeTheme?.cssVars.light.input};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--ring: {activeTheme?.cssVars.light.ring};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--radius: {config.radius}rem;
            </span>
            {['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(
              (prefix) => (
                <span key={prefix} className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}:{' '}
                  {
                    activeTheme?.cssVars.light[
                      prefix as keyof typeof activeTheme.cssVars.light
                    ]
                  }
                  ;
                </span>
              )
            )}
            <span className="line text-white">&nbsp;&nbsp;&#125;</span>
            <span className="line text-white">&nbsp;</span>
            <span className="line text-white">&nbsp;&nbsp;.dark &#123;</span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--background:{' '}
              {activeTheme?.cssVars.dark.background};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--foreground:{' '}
              {activeTheme?.cssVars.dark.foreground};
            </span>
            {[
              'card',
              'popover',
              'primary',
              'secondary',
              'muted',
              'accent',
              'destructive',
            ].map((prefix) => (
              <>
                <span className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}:{' '}
                  {
                    activeTheme?.cssVars.dark[
                      prefix as keyof typeof activeTheme.cssVars.dark
                    ]
                  }
                  ;
                </span>
                <span className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}-foreground:{' '}
                  {
                    activeTheme?.cssVars.dark[
                      `${prefix}-foreground` as keyof typeof activeTheme.cssVars.dark
                    ]
                  }
                  ;
                </span>
              </>
            ))}
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--border:{' '}
              {activeTheme?.cssVars.dark.border};
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--input: {activeTheme?.cssVars.dark.input}
              ;
            </span>
            <span className="line text-white">
              &nbsp;&nbsp;&nbsp;&nbsp;--ring: {activeTheme?.cssVars.dark.ring};
            </span>
            {['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map(
              (prefix) => (
                <span key={prefix} className="line text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;--{prefix}:{' '}
                  {
                    activeTheme?.cssVars.dark[
                      prefix as keyof typeof activeTheme.cssVars.dark
                    ]
                  }
                  ;
                </span>
              )
            )}
            <span className="line text-white">&nbsp;&nbsp;&#125;</span>
            <span className="line text-white">&#125;</span>
          </code>
        </pre>
      </div>
    </ThemeWrapper>
  );
}

function getThemeCode(theme: BaseColor, radius: number) {
  if (!theme) {
    return '';
  }

  return template(BASE_STYLES_WITH_VARIABLES)({
    colors: theme.cssVars,
    radius,
  });
}

const BASE_STYLES_WITH_VARIABLES = `
@layer base {
  :root {
    --background: <%- colors.light["background"] %>;
    --foreground: <%- colors.light["foreground"] %>;
    --card: <%- colors.light["card"] %>;
    --card-foreground: <%- colors.light["card-foreground"] %>;
    --popover: <%- colors.light["popover"] %>;
    --popover-foreground: <%- colors.light["popover-foreground"] %>;
    --primary: <%- colors.light["primary"] %>;
    --primary-foreground: <%- colors.light["primary-foreground"] %>;
    --secondary: <%- colors.light["secondary"] %>;
    --secondary-foreground: <%- colors.light["secondary-foreground"] %>;
    --muted: <%- colors.light["muted"] %>;
    --muted-foreground: <%- colors.light["muted-foreground"] %>;
    --accent: <%- colors.light["accent"] %>;
    --accent-foreground: <%- colors.light["accent-foreground"] %>;
    --destructive: <%- colors.light["destructive"] %>;
    --destructive-foreground: <%- colors.light["destructive-foreground"] %>;
    --border: <%- colors.light["border"] %>;
    --input: <%- colors.light["input"] %>;
    --ring: <%- colors.light["ring"] %>;
    --radius: <%- radius %>rem;
    --chart-1: <%- colors.light["chart-1"] %>;
    --chart-2: <%- colors.light["chart-2"] %>;
    --chart-3: <%- colors.light["chart-3"] %>;
    --chart-4: <%- colors.light["chart-4"] %>;
    --chart-5: <%- colors.light["chart-5"] %>;
  }

  .dark {
    --background: <%- colors.dark["background"] %>;
    --foreground: <%- colors.dark["foreground"] %>;
    --card: <%- colors.dark["card"] %>;
    --card-foreground: <%- colors.dark["card-foreground"] %>;
    --popover: <%- colors.dark["popover"] %>;
    --popover-foreground: <%- colors.dark["popover-foreground"] %>;
    --primary: <%- colors.dark["primary"] %>;
    --primary-foreground: <%- colors.dark["primary-foreground"] %>;
    --secondary: <%- colors.dark["secondary"] %>;
    --secondary-foreground: <%- colors.dark["secondary-foreground"] %>;
    --muted: <%- colors.dark["muted"] %>;
    --muted-foreground: <%- colors.dark["muted-foreground"] %>;
    --accent: <%- colors.dark["accent"] %>;
    --accent-foreground: <%- colors.dark["accent-foreground"] %>;
    --destructive: <%- colors.dark["destructive"] %>;
    --destructive-foreground: <%- colors.dark["destructive-foreground"] %>;
    --border: <%- colors.dark["border"] %>;
    --input: <%- colors.dark["input"] %>;
    --ring: <%- colors.dark["ring"] %>;
    --chart-1: <%- colors.dark["chart-1"] %>;
    --chart-2: <%- colors.dark["chart-2"] %>;
    --chart-3: <%- colors.dark["chart-3"] %>;
    --chart-4: <%- colors.dark["chart-4"] %>;
    --chart-5: <%- colors.dark["chart-5"] %>;
  }
}
`;
