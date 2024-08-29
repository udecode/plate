'use client';

import { type ComponentProps, useState } from 'react';
import * as React from 'react';

import type { Block } from '@/registry/schema';
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { cn } from '@udecode/cn';

import { useLiftMode } from '@/hooks/use-lift-mode';
import PlaygroundDemo from '@/registry/default/example/playground-demo';

import { BlockToolbar } from './block-toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';

const block: any = {
  name: 'playground',
};

export function BlockPreview({
  children,
  className,
  ...props
}: {
  block?: Block;
} & ComponentProps<'div'>) {
  const { isLiftMode } = useLiftMode(block.name);
  // const [isLoading, setIsLoading] = React.useState(true);
  const ref = React.useRef<ImperativePanelHandle>(null);
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div
      className={cn(
        'relative w-full scroll-m-20',
        className,
        fullScreen &&
          'fixed inset-0 z-50 max-w-none [&_[data-slate-editor]]:max-h-[calc(100dvh-44px)]'
        // fullScreen &&
        //   '[&_[data-slate-editor]]:mx-auto [&_[data-slate-editor]]:max-w-[1125px]'
      )}
      id={block.name}
      style={
        {
          '--container-height': block.container?.height,
        } as React.CSSProperties
      }
      {...props}
    >
      <BlockToolbar
        block={block}
        fullScreen={fullScreen}
        resizablePanelRef={ref}
        setFullScreen={setFullScreen}
      />

      {fullScreen && <PlaygroundDemo scrollSelector="playground-full-screen" />}

      {!fullScreen && (
        <>
          <div
            className={cn(
              'relative rounded-lg border bg-background',
              !fullScreen && 'md:hidden',
              isLiftMode ? 'border-border/50' : 'border-border'
            )}
          >
            <div className="chunk-mode relative z-20 w-full bg-background">
              <PlaygroundDemo scrollSelector="playground-preview-1" />
            </div>
          </div>

          <div className="relative after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-lg after:bg-muted max-md:hidden">
            <ResizablePanelGroup
              className="relative z-10"
              direction="horizontal"
            >
              <ResizablePanel
                className={cn(
                  'relative rounded-lg border bg-background',
                  isLiftMode ? 'border-border/50' : 'border-border'
                )}
                defaultSize={100}
                minSize={30}
                ref={ref}
              >
                <div className="chunk-mode relative z-20 w-full bg-background">
                  <PlaygroundDemo scrollSelector="playground-preview-2" />
                </div>

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
        </>
      )}
    </div>
  );
}
