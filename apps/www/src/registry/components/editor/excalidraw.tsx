'use client';

import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types';
import { ExcalidrawPlugin, useExcalidrawSync } from 'platejs/excalidraw/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';
import { flushSync } from 'react-dom';

import { cn } from '@/lib/utils';

import '@excalidraw/excalidraw/index.css';

export function ExcalidrawElement(
  props: EditorElementProps<typeof ExcalidrawPlugin>
) {
  const { children, element } = props;
  const [excalidraw, setExcalidraw] = React.useState<
    typeof import('@excalidraw/excalidraw') | null
  >(null);
  const [api, setApi] = React.useState<ExcalidrawImperativeAPI | null>(null);
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected({ mode: 'text' });
  const Excalidraw = excalidraw?.Excalidraw;
  const containerRef = React.useRef<HTMLDivElement>(null);
  useExcalidrawSync({ api, excalidraw });

  // Excalidraw caches its screen offset and rereads it only on resize and,
  // debounced, on scroll of the one container it found scrollable at mount, so
  // any other scroll misplaces pointer input. A capture listener refreshes the
  // offset in flushSync, because React may defer a plain update past
  // Excalidraw's own handler in the same event, such as in a shadow root.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!api || !container) return undefined;
    const onInput = () => {
      const rect = container
        .querySelector('.excalidraw')
        ?.getBoundingClientRect();
      const { offsetLeft, offsetTop } = api.getAppState();
      if (rect && (rect.left !== offsetLeft || rect.top !== offsetTop)) {
        flushSync(api.refresh);
      }
    };
    const listeners = new AbortController();
    for (const type of ['pointerdown', 'pointermove', 'wheel', 'drop']) {
      container.addEventListener(type, onInput, {
        capture: true,
        signal: listeners.signal,
      });
    }
    return () => listeners.abort();
  }, [api]);

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
    <EditorElement {...props}>
      <div contentEditable={false} data-editor-root-chrome-ignore="true">
        <div
          ref={containerRef}
          className={cn(
            'mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border data-[selected=true]:ring-2 data-[selected=true]:ring-ring'
          )}
          data-selected={selected}
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
    </EditorElement>
  );
}

export const ExcalidrawKit = [
  ExcalidrawPlugin.configure({ component: ExcalidrawElement }),
];
