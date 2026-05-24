'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import type { ImperativePanelHandle } from 'react-resizable-panels';

import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import PlaygroundDemo from '@/registry/examples/playground-demo';

import { PlaygroundPreviewToolbar } from './playground-preview-toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';

const i18n = {
  cn: {
    description: 'AI 编辑器',
  },
  en: {
    description: 'An AI editor',
  },
};

export function PlaygroundPreview({
  className,
  ...props
}: {
  block?: any;
} & ComponentProps<'div'>) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  const block: any = {
    description: content.description,
    name: 'editor-ai',
    src: '/blocks/playground',
  };

  const ref = React.useRef<ImperativePanelHandle>(null);

  return (
    <div
      id={block.name}
      className={cn('relative w-full scroll-m-28', className)}
      style={
        {
          '--container-height': block.container?.height,
        } as React.CSSProperties
      }
      {...props}
    >
      <PlaygroundPreviewToolbar block={block} resizablePanelRef={ref} />

      <ResizablePanelGroup className="relative z-10" direction="horizontal">
        <ResizablePanel
          ref={ref}
          className="relative rounded-lg border bg-background max-sm:w-full max-sm:flex-auto!"
          defaultSize={100}
          minSize={30}
        >
          <div className="themes-wrapper chunk-mode relative z-20 w-full bg-background">
            <React.Suspense fallback={null}>
              <PlaygroundDemo className="h-[650px]" />
            </React.Suspense>
          </div>
        </ResizablePanel>

        <ResizableHandle className="after:-translate-x-px after:-translate-y-1/2 relative hidden w-3 bg-transparent p-0 after:absolute after:top-1/2 after:right-0 after:h-8 after:w-[6px] after:rounded-full after:bg-border after:transition-all hover:after:h-10 sm:block" />
        <ResizablePanel defaultSize={0} minSize={0} />
      </ResizablePanelGroup>
    </div>
  );
}
