import React, { useRef } from 'react';
import Excalidraw from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/components/App';
import { TExcalidrawProps } from '../../types';
import { getExcalidrawElementStyles } from './ExcalidrawElement.styles';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const ExcalidrawElement = ({
  attributes,
  children,
  nodeProps,
  element,
  styles: _styles,
  scrollToContent = true,
  libraryItems = [],
  excalidrawProps: _excalidrawProps,
}: ExcalidrawElementProps) => {
  const styles = getExcalidrawElementStyles(_styles);
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
    // onChange: (elements: readonly ExcalidrawElementType[], state: AppState) => {
    // const path = ReactEditor.findPath(editor, element);

    // FIXME: setNodes triggers render loop as onChange is triggered on rerender
    // in the meantime, the prop can be used to save the data outside slate
    // setNodes(editor, { data: { elements, state } }, { at: path });
    // },
    ..._excalidrawProps,
  };

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <div css={styles?.excalidrawWrapper}>
          <Excalidraw {...nodeProps} {...(excalidrawProps as any)} />
        </div>
      </div>
      {children}
    </div>
  );
};

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
