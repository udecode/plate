import type { NodeEntry, SlateEditor, TElement } from 'platejs';

import { getRegistryReferences } from '../registry';

export const getFootnoteReferences = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => getRegistryReferences(editor, { identifier }) as NodeEntry<TElement>[];
