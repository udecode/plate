'use client';

import * as React from 'react';

import type { Block } from '@/registry/schema';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { cn } from '@udecode/cn';

import { BlockToolbar } from './block-toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';

export function BlockPreview({
  block,
}: {
  block: Pick<
    Block,
    'container' | 'description' | 'descriptionSrc' | 'name' | 'src'
  >;
}) {
  const ref = React.useRef<ImperativePanelHandle>(null);

  return (
    <div
      id={block.name}
      className="relative grid w-full scroll-m-14 gap-4"
      style={
        {
          '--container-height': block.container?.height,
        } as React.CSSProperties
      }
    >
      <BlockToolbar block={block} resizablePanelRef={ref} />
      <ResizablePanelGroup className="relative z-10" direction="horizontal">
        <ResizablePanel
          ref={ref}
          className={cn(
            'relative rounded-lg border bg-background max-sm:w-full max-sm:!flex-auto'
          )}
          defaultSize={100}
          minSize={30}
        >
          {/* <Image
            className="absolute left-0 top-0 z-20 w-[970px] max-w-none bg-background data-[block=sidebar-10]:left-auto data-[block=sidebar-10]:right-0 data-[block=sidebar-11]:-top-1/3 data-[block=sidebar-14]:left-auto data-[block=sidebar-14]:right-0 data-[block=login-01]:max-w-full data-[block=sidebar-13]:max-w-full data-[block=sidebar-15]:max-w-full dark:hidden sm:w-[1280px] md:hidden md:dark:hidden"
            alt={block.name}
            data-block={block.name}
            height={900}
            src={`/images/blocks/${block.name}.png`}
            width={1440}
          />
          <Image
            className="absolute left-0 top-0 z-20 hidden w-[970px] max-w-none bg-background data-[block=sidebar-10]:left-auto data-[block=sidebar-10]:right-0 data-[block=sidebar-11]:-top-1/3 data-[block=sidebar-14]:left-auto data-[block=sidebar-14]:right-0 data-[block=login-01]:max-w-full data-[block=sidebar-13]:max-w-full data-[block=sidebar-15]:max-w-full dark:block sm:w-[1280px] md:hidden md:dark:hidden"
            alt={block.name}
            data-block={block.name}
            height={900}
            src={`/images/blocks/${block.name}-dark.png`}
            width={1440}
          /> */}
          <iframe
            className={cn('chunk-mode relative z-20 w-full bg-background')}
            title={block.name}
            height={block.container?.height ?? 700}
            src={block.src ?? `/blocks/${block.name}`}
          />
        </ResizablePanel>
        <ResizableHandle className="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block" />
        <ResizablePanel defaultSize={0} minSize={0} />
      </ResizablePanelGroup>
    </div>
  );
}
