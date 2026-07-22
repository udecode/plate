import type { BaseEditor } from '@platejs/core';
import { getRegistryReferences } from '../registry';

export const getFootnoteReferences = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => getRegistryReferences(editor, { identifier });
