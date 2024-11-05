'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import type { NpmCommands } from '@/types/unist';
import type { DropdownMenuTriggerProps } from '@radix-ui/react-dropdown-menu';

import { CheckIcon, ClipboardIcon } from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';

import { type Event, trackEvent } from '@/lib/events';
import { Button } from '@/registry/default/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/default/plate-ui/dropdown-menu';

import { Icons } from './icons';

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
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      size="icon"
      variant={variant}
      className={cn(
        'relative z-10 size-6 text-slate-50 hover:bg-slate-700 hover:text-slate-50 [&_svg]:size-3',
        className
      )}
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

interface CopyWithClassNamesProps extends DropdownMenuTriggerProps {
  classNames: string;
  value: string;
  className?: string;
}

export function CopyWithClassNames({
  className,
  classNames,
  value,
}: CopyWithClassNamesProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  const copyToClipboard = React.useCallback((_value: string) => {
    copyToClipboardWithMeta(_value);
    setHasCopied(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'relative z-10 size-6 text-slate-50 hover:bg-slate-700 hover:text-slate-50',
            className
          )}
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

interface CopyNpmCommandButtonProps extends DropdownMenuTriggerProps {
  commands: Required<NpmCommands>;
}

export function CopyNpmCommandButton({
  className,
  commands,
}: CopyNpmCommandButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  const copyCommand = React.useCallback(
    (value: string, pm: 'bun' | 'npm' | 'pnpm' | 'yarn') => {
      void copyToClipboardWithMeta(value, {
        name: 'copy_npm_command',
        properties: {
          command: value,
          pm,
        },
      });
      setHasCopied(true);
    },
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'relative z-10 size-6 text-slate-50 hover:bg-slate-700 hover:text-slate-50',
            className
          )}
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
        <DropdownMenuItem
          onClick={() => copyCommand(commands.__npmCommand__, 'npm')}
        >
          npm
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copyCommand(commands.__yarnCommand__, 'yarn')}
        >
          yarn
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copyCommand(commands.__pnpmCommand__, 'pnpm')}
        >
          pnpm
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copyCommand(commands.__bunCommand__, 'bun')}
        >
          bun
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
