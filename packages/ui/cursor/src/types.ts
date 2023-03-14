import { CSSProperties } from 'react';
import { UnknownObject } from '@udecode/plate-common';
import { Range } from 'slate';

export type SelectionRect = {
  width: number;
  height: number;

  top: number;
  left: number;
};

export type CaretPosition = {
  height: number;

  top: number;
  left: number;
};

export type CursorState<TCursorData extends UnknownObject = UnknownObject> = {
  key?: any;
  selection: Range | null;
  data?: TCursorData;
};

export interface CursorOverlayState<TCursorData extends Record<string, unknown>>
  extends CursorState<TCursorData> {
  caretPosition: CaretPosition | null;
  selectionRects: SelectionRect[];
}

export type CursorData = {
  style?: CSSProperties;
  selectionStyle?: CSSProperties;
};
