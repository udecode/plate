'use client';

import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { ExcalidrawPlugin } from '@platejs/excalidraw/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import '@excalidraw/excalidraw/index.css';

export function ExcalidrawElement(
  props: PlateElementProps<typeof ExcalidrawPlugin>
) {
  const { children, element } = props;
  const [Excalidraw, setExcalidraw] = React.useState<
    (typeof import('@excalidraw/excalidraw'))['Excalidraw'] | null
  >(null);
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const lastSavedDataRef = React.useRef(
    element.data ? JSON.stringify(element.data) : null
  );

  React.useEffect(() => {
    void import('@excalidraw/excalidraw').then((module) =>
      setExcalidraw(() => module.Excalidraw)
    );
  }, []);

  // Excalidraw treats initialData as an initialization boundary and mutates it.
  const initialData = React.useMemo(
    () => ({
      appState: element.data?.state
        ? (structuredClone(element.data.state) as Partial<AppState>)
        : undefined,
      elements: element.data?.elements
        ? (structuredClone(
            element.data.elements
          ) as unknown as readonly OrderedExcalidrawElement[])
        : [],
      libraryItems: [],
      scrollToContent: true,
    }),
    [element.data]
  );

  const excalidrawProps = {
    autoFocus: false,
    initialData,
    onChange: readOnly
      ? undefined
      : (
          elements: readonly OrderedExcalidrawElement[],
          state: Partial<AppState>
        ) => {
          const dataJson = JSON.stringify({ elements, state });

          if (lastSavedDataRef.current === dataJson) return;

          const path = editor.read.nodes.path(element);

          if (!path) return;

          lastSavedDataRef.current = dataJson;
          editor.update.nodes.set(
            { data: JSON.parse(dataJson) as NonNullable<typeof element.data> },
            { at: path }
          );
        },
  } satisfies ExcalidrawProps;

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div
          className={cn(
            'mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border'
          )}
        >
          {Excalidraw && (
            <Excalidraw {...excalidrawProps} viewModeEnabled={readOnly} />
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
