import type React from 'react';

import type { Range } from '@platejs/plite';
import type { UnknownObject } from '@udecode/utils';

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
  id: string;
  selectionRects: readonly SelectionRect[];
}

export type CursorState<TCursorData extends UnknownObject = UnknownObject> = {
  selection: Range | null;
  data?: TCursorData;
};

export type SelectionRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export const FROZEN_EMPTY_ARRAY: readonly SelectionRect[] = Object.freeze([]);
