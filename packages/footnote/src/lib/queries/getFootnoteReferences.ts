import type { NodeEntry, SlateEditor } from 'platejs';

import { getRegistryReferences } from '../registry';
import type { FootnoteElement } from '../types';

export const getFootnoteReferences = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) =>
  getRegistryReferences(editor, {
    identifier,
  }) as NodeEntry<FootnoteElement>[];
