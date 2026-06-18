import { isEdge } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TLocation } from '../../interfaces/index';
import type { Point } from '../../interfaces/point';

export const isEdgePoint = (editor: Editor, point: Point, at: TLocation) =>
  isEdge(editor as any, point, at);
