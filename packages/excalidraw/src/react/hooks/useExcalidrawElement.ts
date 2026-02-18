import React from 'react';

import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type {
  AppState,
  ExcalidrawImperativeAPI,
  LibraryItems,
} from '@excalidraw/excalidraw/types';

import { cloneDeep, isEqual } from 'lodash';
import { useEditorRef, useReadOnly } from 'platejs/react';

import type { TExcalidrawElement } from '../../lib';
import type { TExcalidrawProps } from '../types';

export const useExcalidrawElement = ({
  element,
  libraryItems = [],
  scrollToContent = true,
}: {
  element: TExcalidrawElement;
  libraryItems?: LibraryItems;
  scrollToContent?: boolean;
}) => {
  const [Excalidraw, setExcalidraw] = React.useState<any>(null);
  const editor = useEditorRef();
  const readOnly = useReadOnly();

  // Store last saved data for deduplication
  const lastSavedDataRef = React.useRef<{ elements: any; state: any } | null>(
    null
  );

  React.useEffect(() => {
    void import('@excalidraw/excalidraw').then((comp) =>
      setExcalidraw(comp.Excalidraw)
    );
  });

  const _excalidrawRef = React.useRef<ExcalidrawImperativeAPI>(null);

  // Create save function with deduplication only
  const handleChange = React.useCallback(
    (elements: readonly OrderedExcalidrawElement[], state: AppState) => {
      if (readOnly) return;

      // Create deep copies to avoid read-only property errors
      const newData = {
        elements: cloneDeep(elements),
        state: cloneDeep(state),
      };

      // Use lodash isEqual for deep comparison and deduplication
      if (
        lastSavedDataRef.current &&
        isEqual(lastSavedDataRef.current, newData)
      ) {
        return;
      }

      try {
        const path = editor.api.findPath(element);
        if (path) {
          lastSavedDataRef.current = newData;
          editor.tf.setNodes({ data: newData }, { at: path });
        }
      } catch (error) {
        console.error('Failed to save Excalidraw data:', error);
      }
    },
    [editor, element, readOnly]
  );

  // Create mutable copies of initial data to ensure Excalidraw can modify them
  const initialData = React.useMemo(
    () => ({
      appState: element.data?.state ? cloneDeep(element.data.state) : undefined,
      elements: element.data?.elements ? cloneDeep(element.data.elements) : [],
      libraryItems: cloneDeep(libraryItems),
      scrollToContent,
    }),
    [element.data?.state, element.data?.elements, libraryItems, scrollToContent]
  );

  const excalidrawProps: TExcalidrawProps = {
    autoFocus: false,
    initialData,
    excalidrawAPI: (api) => {
      _excalidrawRef.current = api;
    },
    // Use deduplicated onChange handler without debouncing
    onChange: readOnly ? undefined : handleChange,
  };

  return {
    Excalidraw,
    excalidrawProps,
  };
};
