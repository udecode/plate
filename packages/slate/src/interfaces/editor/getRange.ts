import { Editor } from 'slate';

import type { At } from '../../types';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export const getRange = (editor: TEditor, at: At, to?: At) =>
  Editor.range(editor as any, getAt(editor, at)!, getAt(editor, to));
