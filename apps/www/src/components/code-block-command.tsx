'use client';

import * as React from 'react';

import type { NpmCommands } from '@/types/unist';

import { CheckIcon, ClipboardIcon, TerminalIcon } from 'lucide-react';

import { copyToClipboardWithMeta } from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

type CodeBlockCommandProps = React.HTMLAttributes<HTMLDivElement> &
  NpmCommands & {
    'data-language'?: string;
    'data-theme'?: string;
  };

export function CodeBlockCommand({
  __bunCommand__,
  __npmCommand__,
  __pnpmCommand__,
  __yarnCommand__,
  className,
  ...props
}: CodeBlockCommandProps) {
  const [config, setConfig] = useConfig();
  const [hasCopied, setHasCopied] = React.useState(false);
  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);
  const packageManager = config.packageManager || 'pnpm';
  const tabs = {
    pnpm: __pnpmCommand__,
    npm: __npmCommand__,
    yarn: __yarnCommand__,
    bun: __bunCommand__,
  };
  const copyCommand = async () => {
    const command = tabs[packageManager];
    if (!command) {
      return;
    }
    const hasCopied = await copyToClipboardWithMeta(command, {
      name: 'copy_npm_command',
      properties: {
        command,
        pm: packageManager,
      },
    });

    if (hasCopied) {
      setHasCopied(true);
    }
  };
  return (
    <div
      className={cn(
        'relative mt-6 overflow-hidden rounded-lg bg-code text-code-foreground',
        className
      )}
      {...props}
    >
      <Tabs
        className="gap-0"
        value={packageManager}
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as 'bun' | 'npm' | 'pnpm' | 'yarn',
          });
        }}
      >
        <div className="flex items-center gap-2 border-border/50 border-b px-3 py-1">
          <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground opacity-70">
            <TerminalIcon className="size-3 text-code" />
          </div>
          <TabsList className="rounded-none bg-transparent p-0">
            {Object.entries(tabs).map(([key]) => (
              <TabsTrigger
                key={key}
                className="data-[state=active]:!bg-background h-7 border border-transparent pt-0.5 shadow-none data-[state=active]:border-input data-[state=active]:shadow-none"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(tabs).map(([key, value]) => (
            <TabsContent key={key} className="mt-0 px-4 py-3.5" value={key}>
              <pre>
                <code
                  className="relative font-mono text-sm leading-none"
                  data-language="bash"
                >
                  {value}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <Button
        data-slot="copy-button"
        data-copied={hasCopied}
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10 size-7 bg-code opacity-70 hover:opacity-100 focus-visible:opacity-100"
        onClick={copyCommand}
      >
        <span className="sr-only">Copy</span>
        {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
      </Button>
    </div>
  );
}
