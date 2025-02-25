import type { NodeEntry, SlateEditor } from '@udecode/plate';

import last from 'lodash/last.js';

import { buildToggleIndex } from '../toggleIndexAtom';

export const getLastEntryEnclosedInToggle = (
  editor: SlateEditor,
  toggleId: string
): NodeEntry | undefined => {
  const toggleIndex = buildToggleIndex(editor.children);
  const entriesInToggle = editor.children
    .map((node, index) => [node, [index]] as NodeEntry)
    .filter(([node]) => {
      return (toggleIndex.get(node.id as string) || []).includes(toggleId);
    });

  return last(entriesInToggle);
};
