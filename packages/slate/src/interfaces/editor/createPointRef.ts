import type { EditorPointRefOptions } from 'slate/dist/interfaces/editor';

import { type Point, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const createPointRef = (
  editor: TEditor,
  point: Point,
  options?: EditorPointRefOptions
) => Editor.pointRef(editor as any, point, options as any);
