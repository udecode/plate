import { isEnd } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TLocation } from '../../interfaces/index';
import type { Point } from '../../interfaces/point';

export const isEndPoint = (
  editor: Editor,
  point: Point | null | undefined,
  at: TLocation
) => !!point && isEnd(editor as any, point, at);
