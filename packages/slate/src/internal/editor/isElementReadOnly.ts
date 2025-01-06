import type { Modify } from '@udecode/utils';

import { type EditorElementReadOnlyOptions, elementReadOnly } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { QueryMode, QueryVoids } from '../../types';

export const isElementReadOnly = <E extends Editor = Editor>(
  editor: E,
  options?: Modify<EditorElementReadOnlyOptions, QueryMode & QueryVoids>
) => elementReadOnly(editor as any, options);
