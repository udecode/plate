import { elementReadOnly } from 'slate';

import type { EditorElementReadOnlyOptions } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';

export const isElementReadOnly = <E extends Editor = Editor>(
  editor: E,
  options?: EditorElementReadOnlyOptions
) => elementReadOnly(editor as any, options);
