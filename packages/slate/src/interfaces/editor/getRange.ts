import { type Location, range } from 'slate';

import type { TEditor } from './TEditor';

export const getRange = (editor: TEditor, at: Location, to?: Location) =>
  range(editor as any, at, to);
