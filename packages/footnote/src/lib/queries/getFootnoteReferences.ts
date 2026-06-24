import type { NodeEntry, BasePlateEditor } from 'platejs';

import { getRegistryReferences } from '../registry';
import type { FootnoteElement } from '../types';

export const getFootnoteReferences = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) =>
  getRegistryReferences(editor, {
    identifier,
  }) as NodeEntry<FootnoteElement>[];
