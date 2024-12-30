import type { Modify } from '@udecode/utils';

import { type EditorElementReadOnlyOptions, Editor } from 'slate';

import type { QueryMode, QueryVoids } from '../../types';
import type { TEditor } from './TEditor';

export const isElementReadOnly = <E extends TEditor = TEditor>(
  editor: E,
  options?: Modify<EditorElementReadOnlyOptions, QueryMode & QueryVoids>
) => Editor.elementReadOnly(editor as any, options);
