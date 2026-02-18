import type React from 'react';

import type { TRange, UnknownObject } from 'platejs';

export interface CaretPosition {
  height: number;
  left: number;
  top: number;
}

export interface CursorData {
  [key: string]: unknown;
  selectionStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

export interface CursorOverlayState<TCursorData extends Record<string, unknown>>
  extends CursorState<TCursorData> {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
}

export interface CursorState<
  TCursorData extends UnknownObject = UnknownObject,
> {
  id: any;
  selection: TRange | null;
  data?: TCursorData;
}

export interface SelectionRect {
  height: number;
  left: number;
  top: number;
  width: number;
}
