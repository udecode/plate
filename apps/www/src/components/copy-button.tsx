'use client';

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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


export function copyToClipboardWithMeta(value: string, event?: Event) {
  navigator.clipboard.writeText(value)
  if (event) {
    trackEvent(event)
  }
}

export function CopyButton({
  className,
  event,
  value,
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof Button> & {
  value: string
  event?: Event["name"]
  src?: string
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          className={cn(
            "bg-code absolute top-3 right-2 z-10 size-7 hover:opacity-100 focus-visible:opacity-100",
            className
          )}
          onClick={() => {
            copyToClipboardWithMeta(
              value,
              event
                ? {
                    name: event,
                    properties: {
                      code: value,
                    },
                  }
                : undefined
            )
            setHasCopied(true)
          }}
          data-slot="copy-button"
          {...props}
        >
          <span className="sr-only">Copy</span>
          {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {hasCopied ? "Copied" : "Copy to Clipboard"}
      </TooltipContent>
    </Tooltip>
  )
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
            onClick={() => copyCommand(commands.__yarnCommand__, 'yarn')}
          >
            yarn
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
