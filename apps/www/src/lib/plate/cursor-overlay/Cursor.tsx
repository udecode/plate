import React from 'react';
import { CursorData, CursorProps } from '@udecode/plate-cursor';
import { cn } from '@udecode/plate-tailwind';

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
