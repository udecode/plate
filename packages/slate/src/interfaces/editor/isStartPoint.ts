import { type Location, type Point, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const isStartPoint = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
) => !!point && Editor.isStart(editor as any, point, at);
