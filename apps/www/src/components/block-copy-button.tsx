'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import { CheckIcon, ClipboardIcon } from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';

import { type Event, trackEvent } from '@/lib/events';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

export function BlockCopyButton({
  className,
  code,
  event,
  name,
  ...props
}: {
  code: string;
  event: Event['name'];
  name: string;
} & ComponentProps<typeof Button>) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className={cn('size-7 rounded-[6px] [&_svg]:size-3.5', className)}
          onClick={() => {
            void navigator.clipboard.writeText(code);
            trackEvent({
              name: event,
              properties: {
                name,
              },
            });
            setHasCopied(true);
          }}
          {...props}
        >
          <span className="sr-only">Copy</span>
          {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-black text-white">Copy code</TooltipContent>
    </Tooltip>
  );
}
