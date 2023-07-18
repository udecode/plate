import React, { RefObject } from 'react';
import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';
import {
  getPluginOptions,
  usePlateEditorState,
  usePlateSelectors,
} from '@udecode/plate-core';
import { UnknownObject } from '@udecode/utils';
import { flushSync } from 'react-dom';

import { KEY_YJS, YjsPlugin } from './createYjsPlugin';
import { useYjsSelectors } from './yjsStore';

export interface CaretPosition {
  height: number;
  top: number;
  left: number;
}

export interface SelectionRect {
  width: number;
  height: number;

  top: number;
  left: number;
}

export type RenderSelectionRect<
  TCursorData extends UnknownObject = UnknownObject,
> = React.FC<Pick<CursorProps<TCursorData>, 'data' | 'selectionRect'>>;
export type RenderCaret<TCursorData extends UnknownObject = UnknownObject> =
  React.FC<Pick<CursorProps<TCursorData>, 'data' | 'caretPosition'>>;

export interface CursorProps<
  TCursorData extends UnknownObject = UnknownObject,
> {
  data: TCursorData;
  selectionRect: SelectionRect;
  caretPosition: CaretPosition;
}

export interface CursorOverlayProps<
  TCursorData extends UnknownObject = UnknownObject,
> {
  onRenderSelectionRect: RenderSelectionRect<TCursorData>;
  onRenderCaret: RenderCaret<TCursorData>;
  containerRef?: RefObject<HTMLDivElement>;
}

type Renderers<TCursorData extends UnknownObject = UnknownObject> = Pick<
  CursorOverlayProps<TCursorData>,
  'onRenderSelectionRect' | 'onRenderCaret'
>;

type RemoteSelectionProps<TCursorData extends UnknownObject = UnknownObject> =
  CursorOverlayData<TCursorData> & Renderers<TCursorData>;

const RemoteSelection = <TCursorData extends UnknownObject = UnknownObject>({
  data,
  selectionRects,
  caretPosition,
  onRenderSelectionRect: RenderSelectionRect,
  onRenderCaret: RenderCaret,
}: RemoteSelectionProps<TCursorData>) => {
  if (!data) {
    return null;
  }

  return (
    <>
      {selectionRects.map((rect, i) => {
        return <RenderSelectionRect key={i} data={data} selectionRect={rect} />;
      })}
      {caretPosition && (
        <RenderCaret data={data} caretPosition={caretPosition} />
      )}
    </>
  );
};

type RemoteCursorOverlayContentProps<
  TCursorData extends UnknownObject = UnknownObject,
> = { containerRef?: RefObject<HTMLDivElement> } & Renderers<TCursorData>;

function RemoteCursorOverlayContent<
  TCursorData extends UnknownObject = UnknownObject,
>({
  containerRef,
  onRenderSelectionRect,
  onRenderCaret,
}: RemoteCursorOverlayContentProps<TCursorData>) {
  const [cursors] = useRemoteCursorOverlayPositions<TCursorData>({
    containerRef,
  });

  return (
    <>
      {cursors.map((cursor) => (
        <RemoteSelection
          key={cursor.clientId}
          {...cursor}
          onRenderSelectionRect={onRenderSelectionRect}
          onRenderCaret={onRenderCaret}
        />
      ))}
    </>
  );
}

export function RemoteCursorOverlay<
  TCursorData extends UnknownObject = UnknownObject,
>(props: CursorOverlayProps<TCursorData>) {
  const editor = usePlateEditorState();
  const isRendered = usePlateSelectors().isRendered();
  const isSynced = useYjsSelectors.isSynced();
  const { disableCursors } = getPluginOptions<YjsPlugin>(editor, KEY_YJS);

  console.log("editor", editor);

  const hidden =
    disableCursors ||
    !editor ||
    editor.children.length === 0 ||
    !isSynced ||
    !isRendered;

  // existing issue with @slate-yjs/react https://github.com/BitPhinix/slate-yjs/issues/372
  if (editor) {
    const { onChange } = editor;
    editor.onChange = () => {
      flushSync(() => {
        onChange();
      });
    };
  }

  if (hidden) return null;

  return <RemoteCursorOverlayContent<TCursorData> {...props} />;
}
