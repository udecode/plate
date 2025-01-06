import { type Location, type Point, isEnd } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const isEndPoint = (
  editor: Editor,
  point: Point | null | undefined,
  at: Location
) => !!point && isEnd(editor as any, point, at);
