import { useEffect, useRef, useState } from 'react';
import {
  ExcalidrawImperativeAPI,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';

import { TExcalidrawElement, TExcalidrawProps } from '..';

export const useExalidawElement = ({
  element,
  libraryItems = [],
  scrollToContent = true,
}: {
  element: TExcalidrawElement;
  scrollToContent?: boolean;
  libraryItems?: LibraryItems;
}) => {
  const [Excalidraw, setExcalidraw] = useState<any>(null);
  useEffect(() => {
    import('@excalidraw/excalidraw').then((comp) =>
      setExcalidraw(comp.Excalidraw)
    );
  });

  const _excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);

  // const editor = usePlateEditorRef();

  const excalidrawProps: TExcalidrawProps = {
    excalidrawRef: _excalidrawRef,
    initialData: {
      elements: element.data?.elements,
      appState: element.data?.state,
      scrollToContent,
      libraryItems,
    },
    autoFocus: false,
    // onChange: (elements: readonly ExcalidrawElementType[], state: AppState) => {
    // const path = findNodePath(editor, element);

    // FIXME: setNodes triggers render loop as onChange is triggered on rerender
    // in the meantime, the prop can be used to save the data outside slate
    // setNodes(editor, { data: { elements, state } }, { at: path });
    // },
  };

  return {
    Excalidraw,
    excalidrawProps,
  };
};
