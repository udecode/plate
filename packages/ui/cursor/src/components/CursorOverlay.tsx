import React, { RefObject } from 'react';
import {
  RenderFunction,
  UnknownObject,
  usePlateSelectors,
} from '@udecode/plate-common';
import { useCursorOverlayPositions } from '../hooks/useCursorOverlayPositions';
import { CursorData, CursorState } from '../types';
import { Cursor, CursorProps } from './Cursor';

export interface CursorOverlayProps<
  TCursorData extends UnknownObject = UnknownObject
> extends Pick<
    CursorProps<CursorData>,
    | 'disableCaret'
    | 'disableSelection'
    | 'onRenderCaret'
    | 'onRenderSelectionRect'
    | 'classNames'
  > {
  /**
   * Cursor states to use for calculating the overlay positions, by key.
   */
  cursors?: Record<string, CursorState<TCursorData>>;

  /**
   * Container the overlay will be rendered in.
   * If set, all returned overlay positions will be relative to this container.
   */
  containerRef?: RefObject<HTMLElement>;

  /**
   * Whether to refresh the cursor overlay positions on container resize.
   * @default true
   */
  refreshOnResize?: boolean;

  /**
   * Overrides `Cursor` component.
   */
  onRenderCursor?: RenderFunction<CursorProps>;
}

export function CursorOverlayContent<
  TCursorData extends UnknownObject = UnknownObject
>({
  classNames,
  onRenderCursor: CursorComponent = Cursor,
  onRenderSelectionRect,
  onRenderCaret,
  ...props
}: CursorOverlayProps<TCursorData>) {
  const { disableCaret, disableSelection } = props;

  const { cursors } = useCursorOverlayPositions(props);

  const cursorProps = {
    classNames,
    onRenderSelectionRect,
    onRenderCaret,
    disableCaret,
    disableSelection,
  };

  return (
    <>
      {cursors.map((cursor) => (
        <CursorComponent key={cursor.key} {...cursorProps} {...cursor} />
      ))}
    </>
  );
}

export function CursorOverlay<
  TCursorData extends UnknownObject = UnknownObject
>(props: CursorOverlayProps<TCursorData>) {
  const isRendered = usePlateSelectors().isRendered();

  if (!isRendered) return null;

  return <CursorOverlayContent {...props} />;
}
