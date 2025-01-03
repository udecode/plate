import { type Location, type Point, isStart } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

export const isStartPoint = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
) => !!point && isStart(editor as any, point, at);
