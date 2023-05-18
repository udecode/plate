import React from 'react';
import { RenderFunction, UnknownObject } from '@udecode/plate-common';
import { ClassNames, cn } from '@udecode/plate-styled-components';
import { CursorData, CursorOverlayState, SelectionRect } from '../types';

export interface CursorProps<TCursorData extends UnknownObject = UnknownObject>
  extends CursorOverlayState<TCursorData>,
    ClassNames<{
      caret: string;
      selectionRect: string;
    }> {
  /**
   * Whether to disable the caret.
   */
  disableCaret?: boolean;

  /**
   * Whether to disable the selection rects.
   */
  disableSelection?: boolean;

  /**
   * Custom caret component.
   * For example, you could display a label next to the caret.
   * @default styled div
   */
  onRenderCaret?: RenderFunction<
    Pick<CursorProps<TCursorData>, 'data' | 'caretPosition'>
  >;

  /**
   * Overrides `Caret` component
   */
  onRenderSelectionRect?: RenderFunction<
    Pick<CursorProps<TCursorData>, 'data'> & {
      selectionRect: SelectionRect;
    }
  >;
}

export function Cursor({
  data,
  selectionRects,
  caretPosition,
  disableCaret,
  disableSelection,
  onRenderCaret: Caret,
  onRenderSelectionRect: Rect,
  classNames,
}: CursorProps<CursorData>) {
  if (!data) {
    return null;
  }

  const { style, selectionStyle = style } = data;

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) =>
          Rect ? (
            <Rect key={i} data={data} selectionRect={position} />
          ) : (
            <div
              key={i}
              className={cn(
                'pointer-events-none absolute z-10 opacity-[0.3]',
                classNames?.selectionRect
              )}
              style={{
                ...selectionStyle,
                ...position,
              }}
            />
          )
        )}
      {!disableCaret &&
        caretPosition &&
        (Caret ? (
          <Caret data={data} caretPosition={caretPosition} />
        ) : (
          <div
            className={cn(
              'pointer-events-none absolute z-10 w-0.5',
              classNames?.caret
            )}
            style={{ ...caretPosition, ...style }}
          />
        ))}
    </>
  );
}
