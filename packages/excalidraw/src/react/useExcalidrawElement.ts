import React from 'react';

import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type {
  AppState,
  ExcalidrawProps as ExcalidrawLibraryProps,
  LibraryItems,
} from '@excalidraw/excalidraw/types';

import { useEditor } from '@platejs/core/react';
import { useEditorReadOnly } from '@platejs/plite-react';
import { cloneDeep, isEqual } from 'lodash';

import type { ExcalidrawElement } from '../lib';

type ExcalidrawComponent =
  typeof import('@excalidraw/excalidraw')['Excalidraw'];

export type ExcalidrawProps = ExcalidrawLibraryProps;

export const useExcalidrawElement = ({
  element,
  libraryItems = [],
  scrollToContent = true,
}: {
  element: ExcalidrawElement;
  libraryItems?: LibraryItems;
  scrollToContent?: boolean;
}) => {
  const [Excalidraw, setExcalidraw] =
    React.useState<ExcalidrawComponent | null>(null);
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  const lastSavedDataRef = React.useRef<ExcalidrawElement['data']>(null);

  React.useEffect(() => {
    void import('@excalidraw/excalidraw').then((comp) =>
      setExcalidraw(() => comp.Excalidraw)
    );
  }, []);

  const handleChange = (
    elements: readonly OrderedExcalidrawElement[],
    state: Partial<AppState>
  ) => {
    if (readOnly) return;

    try {
      const newData: NonNullable<ExcalidrawElement['data']> = JSON.parse(
        JSON.stringify({ elements, state })
      );

      if (
        lastSavedDataRef.current &&
        isEqual(lastSavedDataRef.current, newData)
      ) {
        return;
      }

      const path = editor.read.nodes.path(element);
      if (path) {
        lastSavedDataRef.current = newData;
        editor.update.nodes.set({ data: newData }, { at: path });
      }
    } catch (error) {
      console.error('Failed to save Excalidraw data:', error);
    }
  };

  // Excalidraw treats initialData as an initialization boundary and mutates it.
  const initialData = React.useMemo(
    () => ({
      appState: element.data?.state
        ? (cloneDeep(element.data.state) as Partial<AppState>)
        : undefined,
      elements: element.data?.elements
        ? (cloneDeep(
            element.data.elements
          ) as unknown as readonly OrderedExcalidrawElement[])
        : [],
      libraryItems: cloneDeep(libraryItems),
      scrollToContent,
    }),
    [element.data?.state, element.data?.elements, libraryItems, scrollToContent]
  );

  const excalidrawProps = {
    autoFocus: false,
    initialData,
    onChange: readOnly ? undefined : handleChange,
  } satisfies ExcalidrawProps;

  return {
    Excalidraw,
    excalidrawProps,
  };
};
