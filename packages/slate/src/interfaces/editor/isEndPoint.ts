import { type Location, type Point, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const isEndPoint = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
) => !!point && Editor.isEnd(editor as any, point, at);
