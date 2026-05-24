'use client';

import * as React from 'react';

import type { ImperativePanelHandle } from 'react-resizable-panels';

import {
  CheckIcon,
  Fullscreen,
  Monitor,
  Smartphone,
  Tablet,
  TerminalIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getRegistryInstallCommand } from '@/lib/registry-install';

import { BlockCopyButton } from './block-copy-button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function PlaygroundPreviewToolbar({
  block,
  resizablePanelRef,
}: {
  block: any;
  resizablePanelRef: React.RefObject<ImperativePanelHandle | null>;
}) {
  const src = block.descriptionSrc ?? block.src;
  const installCommand = getRegistryInstallCommand(block.name);

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="mb-4 flex items-center gap-4">
      <Button
        asChild
        variant="link"
        className="whitespace-normal px-1 pb-0 md:px-2"
      >
        <a className="whitespace-nowrap" href={src ?? `#${block.name}`}>
          {block.description}
        </a>
      </Button>

      <div className="ml-auto flex items-center gap-2 pr-[14px]">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-md border bg-muted shadow-none"
          onClick={() => {
            copyToClipboard(installCommand);
          }}
        >
          {isCopied ? <CheckIcon /> : <TerminalIcon />}
          {installCommand}
        </Button>
        <Separator orientation="vertical" className="mx-2 hidden h-4 md:flex" />
        <div className="hidden h-[28px] items-center gap-1.5 rounded-md border bg-background p-[2px] shadow-xs md:flex">
          <ToggleGroup
            className="w-full"
            defaultValue="100"
            onValueChange={(value) => {
              setTimeout(() => {
                if (resizablePanelRef.current) {
                  resizablePanelRef.current.resize(Number.parseInt(value, 10));
                }
              }, 0);
            }}
            type="single"
          >
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="100">
              <Monitor className="size-3.5!" />
            </ToggleGroupItem>
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="60">
              <Tablet className="size-3.5!" />
            </ToggleGroupItem>
            <ToggleGroupItem className="size-[22px] rounded-sm p-0" value="30">
              <Smartphone className="size-3.5!" />
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
