import React from 'react';

import type {
  ExcalidrawImperativeAPI,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';

import type { TExcalidrawElement, TExcalidrawProps } from '..';

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
  React.useEffect(() => {
    void import('@excalidraw/excalidraw').then((comp) =>
      setExcalidraw(comp.Excalidraw)
    );
  });

  const _excalidrawRef = React.useRef<ExcalidrawImperativeAPI>(null);

  // const editor = useEditorRef();

  const excalidrawProps: TExcalidrawProps = {
    autoFocus: false,
    excalidrawRef: _excalidrawRef,
    initialData: {
      appState: element.data?.state,
      elements: element.data?.elements,
      libraryItems,
      scrollToContent,
    },
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
