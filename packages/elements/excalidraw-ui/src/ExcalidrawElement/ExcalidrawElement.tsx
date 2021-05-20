import * as React from 'react';
import { useRef, useState } from 'react';
import Excalidraw, {
  exportToBlob,
  exportToCanvas,
  exportToSvg,
} from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/components/App';
import type { ExcalidrawElement as ExcalidrawElementType } from '@excalidraw/excalidraw/types/element/types';
import {
  AppState,
  ExcalidrawProps,
  SceneData,
} from '@excalidraw/excalidraw/types/types';
import { setNodes } from '@udecode/slate-plugins-common';
import { TElement, useEditorRef } from '@udecode/slate-plugins-core';
import { ClassName, getRootClassNames } from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { ReactEditor } from 'slate-react';
// import { ExcalidrawNodeData } from '@udecode/slate-plugins-excalidraw';
// FIXME
import { ExcalidrawNodeData } from '../../../excalidraw/src';
import { getExcalidrawElementStyles } from './ExcalidrawElement.styles';
import {
  ExcalidrawElementProps,
  ExcalidrawElementStyleSet,
} from './ExcalidrawElement.types';
import { ExcalidrawUrlInput } from './ExcalidrawUrlInput';
import InitialData from './InitialData';

const getClassNames = getRootClassNames<ClassName, ExcalidrawElementStyleSet>();

/**
 * ExcalidrawElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const ExcalidrawElementBase = ({
  attributes,
  children,
  element,
  className,
  styles,
  nodeProps,
}: ExcalidrawElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });
  const initialData = InitialData;

  const editor = useEditorRef();
  const { url } = element;

  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);

  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<ExcalidrawProps['theme']>('light');

  const updateScene = () => {
    const sceneData = {
      elements: [
        {
          type: 'rectangle',
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: 'oDVXy8D6rom3H1-LLH2-f',
          fillStyle: 'hachure',
          strokeWidth: 1,
          strokeStyle: 'solid',
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 93.67578125,
          strokeColor: '#c92a2a',
          backgroundColor: 'transparent',
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: [],
        },
      ],
      appState: {
        viewBackgroundColor: '#edf2ff',
      },
    };
    excalidrawRef.current!.updateScene(sceneData as any);
  };

  return (
    <div {...attributes} className={classNames.root}>
      <div contentEditable={false}>
        <div className={classNames.excalidrawWrapper}>
          <div className="button-wrapper">
            <button
              className="update-scene"
              onClick={updateScene}
              type="button"
            >
              Update Scene
            </button>
            <button
              className="reset-scene"
              onClick={() => {
                excalidrawRef?.current!.resetScene();
              }}
              type="button"
            >
              Reset Scene
            </button>
            <label>
              <input
                type="checkbox"
                checked={viewModeEnabled}
                onChange={() => setViewModeEnabled(!viewModeEnabled)}
              />
              View mode
            </label>
            <label>
              <input
                type="checkbox"
                checked={zenModeEnabled}
                onChange={() => setZenModeEnabled(!zenModeEnabled)}
              />
              Zen mode
            </label>
            <label>
              <input
                type="checkbox"
                checked={gridModeEnabled}
                onChange={() => setGridModeEnabled(!gridModeEnabled)}
              />
              Grid mode
            </label>
          </div>
          <div className="excalidraw-wrapper">
            <Excalidraw
              ref={excalidrawRef}
              initialData={InitialData as any}
              onChange={(
                elements: readonly ExcalidrawElementType[],
                state: AppState
              ) => console.log('Elements :', elements, 'State : ', state)}
              onPointerUpdate={(payload) => console.log(payload)}
              onCollabButtonClick={() =>
                window.alert('You clicked on collab button')
              }
              viewModeEnabled={viewModeEnabled}
              zenModeEnabled={zenModeEnabled}
              gridModeEnabled={gridModeEnabled}
              theme={theme}
              name="Custom name of drawing"
            />
          </div>
          <div className="export-wrapper button-wrapper">
            <button
              onClick={() => {
                const svg = exportToSvg({
                  elements: excalidrawRef.current!.getSceneElements(),
                  appState: {
                    ...initialData.appState,
                  } as any,
                });
                document.querySelector('.export-svg')!.innerHTML =
                  svg.outerHTML;
              }}
              type="button"
            >
              Export to SVG
            </button>
            <div className="export export-svg" />

            <button
              onClick={async () => {
                const blob = await exportToBlob({
                  elements: excalidrawRef.current!.getSceneElements(),
                  mimeType: 'image/png',
                  appState: {
                    ...initialData.appState,
                  } as any,
                });
                setBlobUrl(window.URL.createObjectURL(blob));
              }}
              type="button"
            >
              Export to Blob
            </button>
            <div className="export export-blob">
              <img src={blobUrl!} alt="" />
            </div>

            <button
              onClick={() => {
                const canvas = exportToCanvas({
                  elements: excalidrawRef.current!.getSceneElements(),
                  appState: {
                    ...initialData.appState,
                  } as any,
                });
                setCanvasUrl(canvas.toDataURL());
              }}
              type="button"
            >
              Export to Canvas
            </button>
            <div className="export export-canvas">
              <img src={canvasUrl!} alt="" />
            </div>
          </div>
        </div>

        <ExcalidrawUrlInput
          data-testid="ExcalidrawUrlInput"
          className={classNames.input}
          url={url}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            setNodes<TElement<ExcalidrawNodeData>>(
              editor,
              { url: val },
              { at: path }
            );
          }}
        />
      </div>
      {children}
    </div>
  );
};

/**
 * ExcalidrawElement
 */
export const ExcalidrawElement = styled<
  ExcalidrawElementProps,
  ClassName,
  ExcalidrawElementStyleSet
>(ExcalidrawElementBase, getExcalidrawElementStyles, undefined, {
  scope: 'ExcalidrawElement',
});
