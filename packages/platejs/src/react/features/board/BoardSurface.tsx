import * as React from 'react';

import { BOARD_SHAPES_SLOT } from '../../../features/board/lib/boardShape.internal';
import {
  EditorElement,
  type EditorElementProps,
  useEditor,
  useEditorHistory,
  useModelEditor,
  useElementSelected,
} from '../../core';
import { keepToolbarArrowFromBrowser } from './boardKeys.internal';
import type { BoardPlugin } from './BoardPlugin';
import {
  type BoardViewActions,
  BoardViewContext,
  type BoardViewState,
  createBoardView,
  useBoardViewContext,
} from './boardView.internal';
import type { BoardMessages } from './boardVoice.internal';

export type {
  BoardCamera,
  BoardStyle,
  BoardTool,
  BoardViewActions,
  BoardViewState,
} from './boardView.internal';
export type {
  BoardMessages,
  BoardShapeDescription,
} from './boardVoice.internal';

/**
 * A board's mounted view: a clipped surface that draws the shapes near its
 * camera, at their place and stacking rank, through the board's content root.
 * It owns the view's camera, tool, next style and gestures, which never reach
 * the document; a gesture writes through the board's commands once, on
 * release. Pan with the wheel, a middle-button drag or a drag with Space held,
 * zoom with Mod and the wheel. With the select tool, a touch drag on empty
 * board pans, and a mouse or pen drag there selects the shapes its box holds.
 * `toolbar` renders over the board, where `useBoardView` and
 * `useBoardActions` reach this view. A read-only view or a preview pans and
 * selects but never writes, and a gesture under way when the view turns so
 * ends with no write. The board shows `data-selected` while a selection of
 * its document covers it. Its focus target, `[data-board-focus]`, is its one
 * Tab stop and holds focus while shapes are selected; undo and redo run there
 * and focus follows what they restore. Shift+Enter there or on selected
 * shapes focuses the toolbar's first enabled control and keeps the selection,
 * and Escape on a toolbar control outside an open popup, or a Shift+Tab that
 * leaves the toolbar, returns focus to the focus target. The toolbar's
 * controls keep every other key. On the focus target or selected shapes, `=`
 * or `+` and `-` zoom to the next of 10, 25, 50, 100, 200, 400 and 800
 * percent around the view's center, Shift+0 resets to full size, Shift+1
 * fits every shape, and PageUp and PageDown pan by 80 percent of the view,
 * sideways with Shift.
 * `messages` holds every word the board says, and the view whose surface
 * holds focus says one message per action into the editor's status region.
 * `height` sets this view's height and defaults to the board's stored
 * `height`; it never changes the document.
 */
export function BoardSurface({
  height,
  messages,
  toolbar,
  ...props
}: EditorElementProps<typeof BoardPlugin> & {
  height?: React.CSSProperties['height'];
  messages: BoardMessages;
  toolbar?: React.ReactNode;
}) {
  const { element } = props;
  const editor = useModelEditor();
  const mounted = useEditor();
  const selected = useElementSelected();
  const [view] = React.useState(() =>
    createBoardView(editor, mounted, element, messages)
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
  const history = useEditorHistory({ editor: mounted });

  React.useLayoutEffect(
    () => view.renderWith({ history, messages }),
    [history, messages, view]
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
          height: height ?? element.height,
          overflow: 'clip',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- Tab in a shape's text reaches this layer after the text's own keys; the keys belong to the shapes' text, which owns the role. */}
        <div
          data-board-layer=""
          ref={attach}
          onKeyDown={view.takeTextTab}
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
              ariaLabel: messages.label,
              nodeSelectionFocus: view.focusTarget,
              tabIndex: -1,
              viewport,
            })}
          </div>
        </div>
        <BoardFocusTarget
          focusRef={view.focusTarget}
          instructions={messages.instructions}
          label={messages.label}
        />
        {toolbar && (
          <div
            contentEditable={false}
            data-board-toolbar=""
            role="presentation"
            onKeyDown={keepToolbarArrowFromBrowser}
          >
            {toolbar}
          </div>
        )}
        {props.children}
      </EditorElement>
    </BoardViewContext.Provider>
  );
}

const WITHOUT_OWN_FOCUS_RING: React.CSSProperties = {
  clipPath: 'inset(50%)',
  height: 0,
  position: 'absolute',
  width: 0,
};

// A screen reader passes letters and arrows to a focused application, and
// keeps its own browse keys on a plain element.
function BoardFocusTarget({
  focusRef,
  instructions,
  label,
}: {
  focusRef: React.Ref<HTMLDivElement>;
  instructions: string;
  label: string;
}) {
  const described = React.useId();

  return (
    <>
      <div
        aria-describedby={described}
        aria-label={label}
        contentEditable={false}
        data-board-focus=""
        ref={focusRef}
        role="application"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The application takes the board's one Tab stop and its keys.
        tabIndex={0}
        style={WITHOUT_OWN_FOCUS_RING}
      />
      <div contentEditable={false} hidden id={described}>
        {instructions}
      </div>
    </>
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
