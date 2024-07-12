'use client';

import * as React from 'react';

import type { Block } from '@/registry/schema';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { cn } from '@udecode/cn';

import { useConfig } from '@/hooks/use-config';
import { useLiftMode } from '@/hooks/use-lift-mode';

import { BlockToolbar } from './block-toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';

export function BlockPreview({
  block,
}: {
  block: { hasLiftMode: boolean } & Block;
}) {
  const [config] = useConfig();
  const { isLiftMode } = useLiftMode(block.name);
  const [isLoading, setIsLoading] = React.useState(true);
  const ref = React.useRef<ImperativePanelHandle>(null);

  if (config.style !== block.style) {
    return null;
  }

  return (
    <div
      className="relative grid w-full scroll-m-20 gap-4"
      id={block.name}
      style={
        {
          '--container-height': block.container?.height,
        } as React.CSSProperties
      }
    >
      <BlockToolbar block={block} resizablePanelRef={ref} />

      <div className="relative after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-lg after:bg-muted">
        <ResizablePanelGroup className="relative z-10" direction="horizontal">
          <ResizablePanel
            className={cn(
              'relative rounded-lg border bg-background',
              isLiftMode ? 'border-border/50' : 'border-border'
            )}
            defaultSize={100}
            minSize={30}
            ref={ref}
          >
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <div className="chunk-mode relative z-20 w-full bg-background"></div>

            {/* {isLoading ? ( */}
            {/*  <div className="absolute inset-0 z-10 flex h-[--container-height] w-full items-center justify-center gap-2 text-sm text-muted-foreground"> */}
            {/*    <Icons.spinner className="h-4 w-4 animate-spin" /> */}
            {/*    Loading... */}
            {/*  </div> */}
            {/* ) : null} */}
            {/* <iframe */}
            {/*  src={`/blocks/${block.style}/${block.name}`} */}
            {/*  height={block.container?.height ?? 450} */}
            {/*  className="chunk-mode relative z-20 w-full bg-background" */}
            {/*  onLoad={() => { */}
            {/*    setIsLoading(false) */}
            {/*  }} */}
            {/* /> */}
          </ResizablePanel>
          <ResizableHandle
            className={cn(
              'relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block',
              isLiftMode && 'invisible'
            )}
          />
          <ResizablePanel defaultSize={0} minSize={0} />
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
