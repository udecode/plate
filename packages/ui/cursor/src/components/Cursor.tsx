import React from 'react';
import { RenderFunction, UnknownObject } from '@udecode/plate-common';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { CursorData, CursorOverlayState, SelectionRect } from '../types';
import { getCursorOverlayStyles } from './CursorOverlay.styles';

export interface CursorProps<
  TCursorData extends UnknownObject = UnknownObject
> extends CursorOverlayState<TCursorData>,
    StyledProps<{
      caret: CSSProp;
      selectionRect: CSSProp;
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

export const Cursor = ({
  data,
  selectionRects,
  caretPosition,
  disableCaret,
  disableSelection,
  onRenderCaret: Caret,
  onRenderSelectionRect: Rect,
  ...props
}: CursorProps<CursorData>) => {
  if (!data) {
    return null;
  }

  const { caret, selectionRect } = getCursorOverlayStyles(props);

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
              className={selectionRect?.className}
              css={selectionRect?.css}
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
            className={caret?.className}
            css={caret?.css}
            style={{ ...caretPosition, ...style }}
          />
        ))}
    </>
  );
};
