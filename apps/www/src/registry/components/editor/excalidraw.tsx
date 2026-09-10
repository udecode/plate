'use client';

import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types';
import { ExcalidrawPlugin, useExcalidrawSync } from 'platejs/excalidraw/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import '@excalidraw/excalidraw/index.css';

export function ExcalidrawElement(
  props: PlateElementProps<typeof ExcalidrawPlugin>
) {
  const { children, element } = props;
  const [excalidraw, setExcalidraw] = React.useState<
    typeof import('@excalidraw/excalidraw') | null
  >(null);
  const [api, setApi] = React.useState<ExcalidrawImperativeAPI | null>(null);
  const readOnly = useEditorReadOnly();
  const Excalidraw = excalidraw?.Excalidraw;
  useExcalidrawSync({ api, excalidraw });

  React.useEffect(() => {
    let active = true;
    void import('@excalidraw/excalidraw').then((module) => {
      if (active) setExcalidraw(module);
    });
    return () => {
      active = false;
    };
  }, []);

  // Excalidraw treats initialData as an initialization boundary and mutates it.
  const [initialData] = React.useState(() => ({
    appState: element.data?.state
      ? (structuredClone(element.data.state) as Partial<AppState>)
      : undefined,
    elements: element.data?.elements
      ? (structuredClone(
          element.data.elements
        ) as unknown as readonly OrderedExcalidrawElement[])
      : [],
    files: element.data?.files
      ? (structuredClone(element.data.files) as unknown as BinaryFiles)
      : undefined,
    libraryItems: [],
    scrollToContent: true,
  }));

  return (
    <PlateElement {...props}>
      <div contentEditable={false} data-plite-root-chrome-ignore="true">
        <div
          className={cn(
            'mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border'
          )}
        >
          {Excalidraw && (
            <Excalidraw
              autoFocus={false}
              excalidrawAPI={setApi}
              initialData={initialData}
              viewModeEnabled={readOnly}
            />
          )}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}

export const ExcalidrawKit = [
  ExcalidrawPlugin.configure({ component: ExcalidrawElement }),
];
