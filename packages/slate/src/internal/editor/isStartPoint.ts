import { isStart } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TLocation } from '../../interfaces/index';
import type { Point } from '../../interfaces/point';

export const isStartPoint = (
  editor: Editor,
  point: Point | null | undefined,
  at: TLocation
) => !!point && isStart(editor as any, point, at);
