import React from 'react';

import { useEditorMounted } from '@platejs/core/react';
import type { UnknownObject } from '@udecode/utils';

import type { CursorOverlayState, CursorState, SelectionRect } from './types';
import { useCursorOverlayPositions } from './useCursorOverlay';

export interface CursorOverlayProps<
  TCursorData extends UnknownObject = UnknownObject,
> extends Pick<
    CursorProps<TCursorData>,
    | 'classNames'
    | 'disableCaret'
    | 'disableSelection'
    | 'onRenderCaret'
    | 'onRenderSelectionRect'
  > {
  /**
   * Container the overlay will be rendered in. If set, all returned overlay
   * positions will be relative to this container.
   */
  containerRef?: React.RefObject<HTMLElement | null>;

  /** Cursor states to use for calculating the overlay positions, by key. */
  cursors?: Record<string, CursorState<TCursorData>>;

  /** Component used to render each cursor state. */
  onRenderCursor: React.FC<CursorProps<TCursorData>>;

  /**
   * Whether to refresh the cursor overlay positions on container resize.
   *
   * @default true
   */
  refreshOnResize?: boolean;
}

export type CursorProps<TCursorData extends UnknownObject = UnknownObject> =
  CursorOverlayState<TCursorData> & {
    classNames?: Partial<{
      caret: string;
      selectionRect: string;
    }>;
    /** Whether to disable the caret. */
    disableCaret?: boolean;
    /** Whether to disable the selection rects. */
    disableSelection?: boolean;
    /** Caret renderer forwarded to the cursor component. */
    onRenderCaret?: React.FC<
      Pick<CursorProps<TCursorData>, 'caretPosition' | 'data'>
    >;
    /** Selection-rectangle renderer forwarded to the cursor component. */
    onRenderSelectionRect?: React.FC<
      {
        selectionRect: SelectionRect;
      } & Pick<CursorProps<TCursorData>, 'data'>
    >;
  };

export function CursorOverlayContent<
  TCursorData extends UnknownObject = UnknownObject,
>({
  classNames,
  onRenderCaret,
  onRenderCursor: CursorComponent,
  onRenderSelectionRect,
  ...props
}: CursorOverlayProps<TCursorData>) {
  const { disableCaret, disableSelection } = props;
  const { cursors } = useCursorOverlayPositions(props);

  return (
    <>
      {cursors.map((cursor) => (
        <CursorComponent
          key={cursor.id}
          {...{
            classNames,
            disableCaret,
            disableSelection,
            onRenderCaret,
            onRenderSelectionRect,
          }}
          {...cursor}
        />
      ))}
    </>
  );
}

export function CursorOverlay<
  TCursorData extends UnknownObject = UnknownObject,
>(props: CursorOverlayProps<TCursorData>) {
  const isMounted = useEditorMounted();

  if (!isMounted) return null;

  return <CursorOverlayContent {...props} />;
}
