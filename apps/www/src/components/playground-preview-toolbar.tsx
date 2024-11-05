'use client';

import * as React from 'react';

import type { Block } from '@/registry/schema';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { cn } from '@udecode/cn';
import {
  CheckIcon,
  Fullscreen,
  Monitor,
  Smartphone,
  Tablet,
  TerminalIcon,
} from 'lucide-react';
import Link from 'next/link';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Button } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

import { BlockCopyButton } from './block-copy-button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function PlaygroundPreviewToolbar({
  block,
  resizablePanelRef,
  // fullScreen,
  // setFullScreen,
}: {
  block: { hasLiftMode: boolean } & Block;
  resizablePanelRef: React.RefObject<ImperativePanelHandle | null>;
  // fullScreen: boolean;
  // setFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        'absolute right-0 z-50',
        '-top-4 -translate-y-full'
        // fullScreen && 'bottom-4'
      )}
    >
      <div className="flex items-center gap-2 pr-[14px] sm:ml-auto">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-md border bg-muted shadow-none"
          onClick={() => {
            copyToClipboard(`npx shadcx@latest add plate/${block.name}`);
          }}
        >
          {isCopied ? <CheckIcon /> : <TerminalIcon />}
          npx shadcx add plate/{block.name}
        </Button>
        <Separator orientation="vertical" className="mx-2 hidden h-4 md:flex" />
        <div className="hidden h-[28px] items-center gap-1.5 rounded-md border bg-background p-[2px] shadow-sm md:flex">
          <ToggleGroup
            defaultValue="100"
            onValueChange={(value) => {
              // if (value === 'full') {
              //   setFullScreen(true);

              //   return;
              // }
              // if (fullScreen) {
              //   setFullScreen(false);
              // }

              setTimeout(() => {
                if (resizablePanelRef.current) {
                  resizablePanelRef.current.resize(Number.parseInt(value));
                }
              }, 0);
            }}
            type="single"
          >
            {/* <ToggleGroupItem
              className="size-[22px] rounded-sm p-0"
              value="full"
            >
              <Maximize className="!size-3.5" />
            </ToggleGroupItem> */}
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="100">
              <Monitor className="!size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="60">
              <Tablet className="!size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="30">
              <Smartphone className="!size-3.5" />
            </ToggleGroupItem>
            <Separator orientation="vertical" className="h-4" />
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="size-[22px] rounded-sm p-0"
              title="Open in New Tab"
            >
              <Link href="/blocks/playground" target="_blank">
                <span className="sr-only">Open in New Tab</span>
                <Fullscreen className="size-3.5" />
              </Link>
            </Button>
          </ToggleGroup>
        </div>

        {block.code && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 hidden h-4 md:flex"
            />
            <BlockCopyButton
              name={block.name}
              code={block.code}
              event="copy_block_code"
            />
          </>
        )}
      </div>
    </div>
  );
}
