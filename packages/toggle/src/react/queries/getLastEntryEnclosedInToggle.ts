import type { SlateEditor } from 'platejs';

import last from 'lodash/last.js';

import { buildToggleIndex } from '../toggleIndexAtom';

type NodeEntry = [any, number[]];

export const getLastEntryEnclosedInToggle = (
  editor: SlateEditor,
  toggleId: string
): NodeEntry | undefined => {
  const toggleIndex = buildToggleIndex(editor.children);
  const entriesInToggle = editor.children
    .map((node: any, index: number) => [node, [index]] as NodeEntry)
    .filter(([node]: NodeEntry) =>
      (toggleIndex.get(node.id as string) || []).includes(toggleId)
    );

  return last(entriesInToggle);
};
