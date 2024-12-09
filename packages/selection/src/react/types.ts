import type React from 'react';

import type { UnknownObject } from '@udecode/plate-common';
import type { Range } from 'slate';

export type SelectionRect = {
  height: number;
  left: number;

  top: number;
  width: number;
};

export type CaretPosition = {
  height: number;

  left: number;
  top: number;
};

export type CursorState<TCursorData extends UnknownObject = UnknownObject> = {
  id: any;
  selection: Range | null;
  data?: TCursorData;
};

export interface CursorOverlayState<TCursorData extends Record<string, unknown>>
  extends CursorState<TCursorData> {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
}

export type CursorData = {
  selectionStyle?: React.CSSProperties;
  style?: React.CSSProperties;
};
