import { type Editor, Editor as EditorApi } from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import type { Point } from '../interfaces/point';

export const end = (editor: Editor, at: Location): Point =>
  EditorApi.point(editor, at, { edge: 'end' });
