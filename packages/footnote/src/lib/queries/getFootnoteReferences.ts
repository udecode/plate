import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { getRegistryReferences } from '../registry';

export const getFootnoteReferences = (
  editor: BaseEditor,
  { identifier }: { identifier: string },
  tx?: EditorUpdateTransaction
) => getRegistryReferences(editor, { identifier }, tx);
