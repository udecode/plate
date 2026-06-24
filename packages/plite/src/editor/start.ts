import { point as editorPoint } from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import type { Point } from '../interfaces/point';

export const start = (editor: Editor, at: Location): Point =>
  editorPoint(editor, at, { edge: 'start' });
