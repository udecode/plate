import type React from 'react';

import type { TRange, UnknownObject } from '@udecode/plate';

export type CaretPosition = {
  height: number;
  left: number;
  top: number;
};

export type CursorData = {
  selectionStyle?: React.CSSProperties;
  style?: React.CSSProperties;
};

export interface CursorOverlayState<TCursorData extends Record<string, unknown>>
  extends CursorState<TCursorData> {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
}

export type CursorState<TCursorData extends UnknownObject = UnknownObject> = {
  selection: TRange | null;
  key?: any;
  data?: TCursorData;
};

export type SelectionRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};
