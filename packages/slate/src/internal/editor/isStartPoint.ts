import { type Location, type Point, isStart } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const isStartPoint = (
  editor: Editor,
  point: Point | null | undefined,
  at: Location
) => !!point && isStart(editor as any, point, at);
