'use client';

import * as React from 'react';

import type { Block } from '@/registry/schema';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import {
  CheckIcon,
  Monitor,
  Smartphone,
  Tablet,
  TerminalIcon,
} from 'lucide-react';
import Link from 'next/link';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Button } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function BlockToolbar({
  block,
  resizablePanelRef,
}: {
  block: Pick<
    Block,
    'container' | 'description' | 'descriptionSrc' | 'name' | 'src'
  >;
  resizablePanelRef: React.RefObject<ImperativePanelHandle | null>;
}) {
  const src = block.descriptionSrc ?? block.src;

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Button asChild variant="link" className="whitespace-normal px-1 md:px-2">
        <a
          href={src ?? `#${block.name}`}
          rel={src ? 'noreferrer' : undefined}
          target={src ? '_blank' : undefined}
        >
          {block.description}
        </a>
      </Button>
      <div className="ml-auto flex items-center gap-2 md:pr-[14px]">
        {block.name !== 'potion' && (
          <>
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
            <Separator
              orientation="vertical"
              className="mx-2 hidden h-4 md:flex"
            />
          </>
        )}
        <div className="hidden h-7 items-center gap-1.5 rounded-md border p-[2px] shadow-none md:flex">
          <ToggleGroup
            defaultValue="100"
            onValueChange={(value: any) => {
              if (resizablePanelRef.current) {
                resizablePanelRef.current.resize(Number.parseInt(value));
              }
            }}
            type="single"
          >
            <ToggleGroupItem
              className="size-[22px] rounded-sm p-0"
              value="100"
              title="Desktop"
            >
              <Monitor className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              className="size-[22px] rounded-sm p-0"
              value="60"
              title="Tablet"
            >
              <Tablet className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              className="size-[22px] rounded-sm p-0"
              value="30"
              title="Mobile"
            >
              <Smartphone className="size-3.5" />
            </ToggleGroupItem>
            {/* <Separator orientation="vertical" className="h-4" />
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="size-[22px] rounded-sm p-0"
              title="Open in New Tab"
            >
              <Link
                href={block.src ?? `/blocks/${block.name}`}
                rel={block.src ? 'noreferrer' : undefined}
                target="_blank"
              >  
                <span className="sr-only">Open in New Tab</span>
                <Fullscreen className="size-3.5" />
              </Link>
            </Button> */}
          </ToggleGroup>
        </div>
        <Separator orientation="vertical" className="mx-2 hidden h-4 md:flex" />
        <Link href={block.src ?? `/blocks/${block.name}`} target="_blank">
          <Button
            id={`${block.name}`}
            name={`${block.name}`}
            className="hidden h-[27px] px-3 text-xs shadow-none md:flex"
          >
            Open{' '}
            {block.name === 'potion'
              ? block.name.charAt(0).toUpperCase() + block.name.slice(1)
              : ''}
          </Button>
        </Link>
      </div>
    </div>
  );
}
