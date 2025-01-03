import type { Modify } from '@udecode/utils';

import { type EditorElementReadOnlyOptions, elementReadOnly } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { QueryMode, QueryVoids } from '../../types';

export const isElementReadOnly = <E extends TEditor = TEditor>(
  editor: E,
  options?: Modify<EditorElementReadOnlyOptions, QueryMode & QueryVoids>
) => elementReadOnly(editor as any, options);
