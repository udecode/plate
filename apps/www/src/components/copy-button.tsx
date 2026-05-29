'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import type { NpmCommands } from '@/types/unist';
import type { DropdownMenuTriggerProps } from '@radix-ui/react-dropdown-menu';

import { CheckIcon, ClipboardIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Event, trackEvent } from '@/lib/events';
import { cn } from '@/lib/utils';

import { Icons } from './icons';

const codeCopyButtonClassName =
  'relative z-10 size-6 bg-code text-code-foreground opacity-70 hover:bg-muted-foreground/15 hover:text-code-foreground hover:opacity-100 focus-visible:opacity-100 [&_svg]:!size-3';

interface CopyButtonProps extends ComponentProps<typeof Button> {
  value: string;
  event?: Event['name'];
  src?: string;
}

export function copyToClipboardWithMeta(value: string, event?: Event) {
  void navigator.clipboard.writeText(value);

  if (event) {
    trackEvent(event);
  }
}

export function CopyButton({
  className,
  event,
  src,
  value,
  variant = 'ghost',
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (!hasCopied) return;

    const timeout = setTimeout(() => {
      setHasCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasCopied]);

  return (
    <Button
      size="icon"
      variant={variant}
      className={cn(codeCopyButtonClassName, className)}
      onClick={() => {
        void copyToClipboardWithMeta(
          value,
          event
            ? {
                name: event,
                properties: {
                  code: value,
                },
              }
            : undefined
        );
        setHasCopied(true);
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  );
}

interface CopyNpmCommandButtonProps extends DropdownMenuTriggerProps {
  commands: Required<NpmCommands>;
  icon?: React.ReactNode;
}

export function CopyWithClassNames({
  className,
  classNames,
  value,
}: CopyWithClassNamesProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (!hasCopied) return;

    const timeout = setTimeout(() => {
      setHasCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasCopied]);

  const copyToClipboard = (_value: string) => {
    copyToClipboardWithMeta(_value);
    setHasCopied(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(codeCopyButtonClassName, className)}
        >
          {hasCopied ? (
            <Icons.check className="size-3" />
          ) : (
            <ClipboardIcon className="size-3" />
          )}
          <span className="sr-only">Copy</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => copyToClipboard(value)}>
          <Icons.react />
          <span>Component</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(classNames)}>
          <Icons.tailwind />
          <span>Classname</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CopyWithClassNamesProps extends DropdownMenuTriggerProps {
  classNames: string;
  value: string;
  className?: string;
}

export function CopyNpmCommandButton({
  className,
  commands,
  icon,
}: CopyNpmCommandButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (!hasCopied) return;

    const timeout = setTimeout(() => {
      setHasCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasCopied]);

  const copyCommand = (value: string, pm: 'bun' | 'npm' | 'pnpm') => {
    void copyToClipboardWithMeta(value, {
      name: 'copy_npm_command',
      properties: {
        command: value,
        pm,
      },
    });
    setHasCopied(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(codeCopyButtonClassName, className)}
        >
          {hasCopied ? (
            <Icons.check className="size-3" />
          ) : (
            (icon ?? <ClipboardIcon className="size-3" />)
          )}
          <span className="sr-only">Copy</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => copyCommand(commands.__pnpmCommand__, 'pnpm')}
          >
            pnpm
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => copyCommand(commands.__npmCommand__, 'npm')}
          >
            npm
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => copyCommand(commands.__bunCommand__, 'bun')}
          >
            bun
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
