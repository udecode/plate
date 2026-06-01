'use client';

import * as React from 'react';

import { Check, Terminal } from 'lucide-react';
import { isDefined } from 'platejs';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getRegistryInstallCommand } from '@/lib/registry-install';
import { cn } from '@/lib/utils';

import { CodeBlockWrapper } from './code-block-wrapper';

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  full?: boolean;
  internal?: boolean;
  name?: string;
  open?: boolean;
  src?: string;
  title?: string;
}

export function ComponentSource({
  children,
  className,
  full,
  internal,
  name,
  src,
  title,
  ...props
}: ComponentSourceProps) {
  if (!isDefined(full) && !internal) {
    full = true;
  }

  const displaySrc = title ?? src?.split('/').pop() ?? `${name}.tsx`;
  const installCommand = name ? getRegistryInstallCommand(name) : null;
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="mt-4 mb-6">
      <div className="flex">
        {displaySrc && (
          <Button
            size="sm"
            variant="ghost"
            className="mb-0.5 w-fit select-auto px-4 py-1 font-medium text-foreground text-sm"
            onClick={() => {
              copyToClipboard(displaySrc, {
                tooltip: 'Copied to clipboard',
              });
            }}
          >
            {displaySrc}
          </Button>
        )}

        {!internal && installCommand && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className={cn('flex h-7 px-1.5 shadow-none xl:w-auto')}
              onClick={() => {
                copyToClipboard(installCommand);
              }}
            >
              {isCopied ? <Check /> : <Terminal />}

              <span className="hidden xl:inline">{installCommand}</span>
            </Button>
          </div>
        )}
      </div>

      <CodeBlockWrapper
        className={cn('overflow-hidden rounded-md', className)}
        expandButtonTitle="Expand"
        full={full}
        {...props}
      >
        {children}
      </CodeBlockWrapper>
    </div>
  );
}
