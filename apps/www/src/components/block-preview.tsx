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
  block: Pick<Block, 'container' | 'description' | 'name' | 'src'>;
}) {
  const ref = React.useRef<ImperativePanelHandle>(null);

  // const [scrollPosition, setScrollPosition] = React.useState(
  //   typeof window === 'undefined' ? 0 : window.scrollY
  // );

  // React.useEffect(() => {
  //   if (typeof window === 'undefined') return;

  //   const handleScroll = () => {
  //     if (window.scrollY === 0) return;

  //     setScrollPosition(window.scrollY);
  //   };

  //   document.addEventListener('scroll', handleScroll);

  //   return () => {
  //     document.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  // React.useEffect(() => {
  //   if (typeof window === 'undefined') return;

  //   const handleMessage = (event: MessageEvent) => {
  //     if (event.data === 'iframe_selection_area_added') {
  //       if (scrollPosition <= 0) return;

  //       document.body.style.overflow = 'hidden';
  //       document.body.style.position = 'fixed';
  //       document.body.style.top = `-${scrollPosition}px`;
  //       document.body.style.width = '100%';
  //     }
  //     if (event.data === 'iframe_selection_area_removed') {
  //       document.body.style.overflow = '';
  //       document.body.style.position = '';
  //       document.body.style.top = '';
  //       document.body.style.width = '';

  //       window.scrollTo(0, scrollPosition);
  //     }
  //   };
  //   window.addEventListener('message', handleMessage);

  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, [scrollPosition]);

  return (
    <div
      id={block.name}
      className="relative grid w-full scroll-m-20 gap-4"
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
            'relative aspect-[4/2.5] rounded-lg border bg-background md:aspect-auto'
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
            height={block.container?.height ?? 800}
            src={block.src ?? `/blocks/${block.name}`}
          />
        </ResizablePanel>
        <ResizableHandle className="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-x-px after:-translate-y-1/2 after:rounded-full after:bg-border after:transition-all after:hover:h-10 sm:block" />
        <ResizablePanel defaultSize={0} minSize={0} />
      </ResizablePanelGroup>
    </div>
  );
}
