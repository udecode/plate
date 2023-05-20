import React, { useEffect, useRef, useState } from 'react';
import {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';
import { Value } from '@udecode/plate-common';
import {
  getRootProps,
  PlateElementProps,
} from '@udecode/plate-styled-components';
import {
  TExcalidrawElement,
  TExcalidrawProps,
} from '../../../../../../../packages/ui/nodes/excalidraw/src/types';

export interface ExcalidrawElementProps
  extends PlateElementProps<Value, TExcalidrawElement> {
  scrollToContent?: boolean;

  libraryItems?: LibraryItems;

  excalidrawProps?: ExcalidrawProps;
}

export function ExcalidrawElement(props: ExcalidrawElementProps) {
  const {
    attributes,
    children,
    nodeProps,
    element,
    scrollToContent = true,
    libraryItems = [],
    excalidrawProps: _excalidrawProps,
  } = props;

  const rootProps = getRootProps(props);

  const [Excalidraw, setExcalidraw] = useState<any>(null);
  useEffect(() => {
    import('@excalidraw/excalidraw').then((comp) =>
      setExcalidraw(comp.Excalidraw)
    );
  });

  const _excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);

  // const editor = useEditorRef();

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
    ..._excalidrawProps,
  };

  return (
    <div {...attributes} {...rootProps}>
      <div contentEditable={false}>
        <div className="h-[600px]">
          {Excalidraw && (
            <Excalidraw {...nodeProps} {...(excalidrawProps as any)} />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// const ActionButtons = () => (
//   <div className="button-wrapper">
//     <button className="update-scene" onClick={updateScene} type="button">
//       Update Scene
//     </button>
//     <button
//       className="reset-scene"
//       onClick={() => {
//         excalidrawRef?.current!.resetScene();
//       }}
//       type="button"
//     >
//       Reset Scene
//     </button>
//     <label>
//       <input
//         type="checkbox"
//         checked={viewModeEnabled}
//         onChange={() => setViewModeEnabled(!viewModeEnabled)}
//       />
//       View mode
//     </label>
//     <label>
//       <input
//         type="checkbox"
//         checked={zenModeEnabled}
//         onChange={() => setZenModeEnabled(!zenModeEnabled)}
//       />
//       Zen mode
//     </label>
//     <label>
//       <input
//         type="checkbox"
//         checked={gridModeEnabled}
//         onChange={() => setGridModeEnabled(!gridModeEnabled)}
//       />
//       Grid mode
//     </label>
//   </div>
// );

// const ExportButtons = () => (
//   <div className="export-wrapper button-wrapper">
//     <button
//       onClick={() => {
//         const svg = exportToSvg({
//           elements: excalidrawRef.current!.getSceneElements(),
//           appState: {
//             ...initialData.appState,
//           } as any,
//         });
//         document.querySelector('.export-svg')!.innerHTML = svg.outerHTML;
//       }}
//       type="button"
//     >
//       Export to SVG
//     </button>
//     <div className="export export-svg" />
//
//     <button
//       onClick={async () => {
//         const blob = await exportToBlob({
//           elements: excalidrawRef.current!.getSceneElements(),
//           mimeType: 'image/png',
//           appState: {
//             ...initialData.appState,
//           } as any,
//         });
//         setBlobUrl(window.URL.createObjectURL(blob));
//       }}
//       type="button"
//     >
//       Export to Blob
//     </button>
//     <div className="export export-blob">
//       <img src={blobUrl!} alt="" />
//     </div>
//
//     <button
//       onClick={() => {
//         const canvas = exportToCanvas({
//           elements: excalidrawRef.current!.getSceneElements(),
//           appState: {
//             ...initialData.appState,
//           } as any,
//         });
//         setCanvasUrl(canvas.toDataURL());
//       }}
//       type="button"
//     >
//       Export to Canvas
//     </button>
//     <div className="export export-canvas">
//       <img src={canvasUrl!} alt="" />
//     </div>
//   </div>
// );
