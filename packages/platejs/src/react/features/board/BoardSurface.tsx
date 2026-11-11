import * as React from 'react';

import { BOARD_SHAPES_SLOT } from '../../../features/board/lib/boardShape.internal';
import {
  EditorElement,
  type EditorElementProps,
  useEditor,
  useModelEditor,
  useElementSelected,
} from '../../core';
import type { BoardPlugin } from './BoardPlugin';
import {
  type BoardViewActions,
  BoardViewContext,
  type BoardViewState,
  createBoardView,
  useBoardViewContext,
} from './boardView.internal';

export type {
  BoardCamera,
  BoardStyle,
  BoardTool,
  BoardViewActions,
  BoardViewState,
} from './boardView.internal';

/**
 * A board's mounted view: a clipped surface that draws the shapes near its
 * camera, at their place and stacking rank, through the board's content root.
 * It owns the view's camera, tool, next style and gestures, which never reach
 * the document; a gesture writes through the board's commands once, on
 * release. Pan with the wheel or a drag on the board, zoom with Mod and the
 * wheel. `toolbar` renders over the board, where `useBoardView` and
 * `useBoardActions` reach this view. A read-only view or a preview pans and
 * selects but never writes, and a gesture under way when the view turns so
 * ends with no write. The board shows `data-selected` while a selection of
 * its document covers it.
 */
export function BoardSurface({
  toolbar,
  ...props
}: EditorElementProps<typeof BoardPlugin> & { toolbar?: React.ReactNode }) {
  const { element } = props;
  const editor = useModelEditor();
  const mounted = useEditor();
  const selected = useElementSelected();
  const [view] = React.useState(() =>
    createBoardView(editor, mounted, element)
  );
  const viewport = React.useSyncExternalStore(
    view.subscribeViewport,
    view.viewport,
    view.viewport
  );
  const attach = React.useCallback(
    (layer: HTMLDivElement | null) => (layer ? view.attach(layer) : undefined),
    [view]
  );

  React.useEffect(() => view.connect(), [view]);

  return (
    <BoardViewContext.Provider value={view}>
      <EditorElement
        {...props}
        attributes={{
          ...props.attributes,
          'data-board': view.root,
          'data-selected': selected || undefined,
        }}
        style={{
          height: element.height,
          overflow: 'clip',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div
          data-board-layer=""
          ref={attach}
          style={{
            left: 0,
            position: 'absolute',
            top: 0,
            transformOrigin: '0 0',
            // oxlint-disable-next-line react-doctor/no-permanent-will-change -- The camera moves this layer on every pan and zoom frame; without the promotion a dense pan dropped 70 of 72 frames in Chromium and 44 of 45 in WebKit.
            willChange: 'transform',
          }}
        >
          <div
            style={{
              left: 0,
              position: 'absolute',
              top: 0,
              transformOrigin: '0 0',
            }}
          >
            {props.slots.contentRoot(BOARD_SHAPES_SLOT, {
              ariaLabel: 'Board',
              viewport,
            })}
          </div>
        </div>
        {toolbar && (
          <div contentEditable={false} data-board-toolbar="">
            {toolbar}
          </div>
        )}
        {props.children}
      </EditorElement>
    </BoardViewContext.Provider>
  );
}

/** Read the surrounding board view's state, such as its tool. */
export const useBoardView = <T,>(selector: (view: BoardViewState) => T): T => {
  const view = useBoardViewContext();
  const read = () => selector(view.state());

  return React.useSyncExternalStore(view.subscribe, read, read);
};

/** Change the surrounding board view's tool, next style and camera. */
export const useBoardActions = (): BoardViewActions =>
  useBoardViewContext().actions;
