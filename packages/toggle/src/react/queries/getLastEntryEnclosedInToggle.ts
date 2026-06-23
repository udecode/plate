import type { NodeEntry, SlateEditor } from 'platejs';

import last from 'lodash/last.js';

import type { ToggleIndexElement } from '../internal/toggleElement';

import { isToggleIndexElement } from '../internal/toggleElement';
import { buildToggleIndex } from '../toggleIndexAtom';

export const getLastEntryEnclosedInToggle = (
  editor: SlateEditor,
  toggleId: string
): NodeEntry<ToggleIndexElement> | undefined => {
  const toggleIndex = buildToggleIndex(editor.children);
  const entriesInToggle = editor.children
    .flatMap((node, index): NodeEntry<ToggleIndexElement>[] =>
      isToggleIndexElement(node) ? [[node, [index]]] : []
    )
    .filter(([node]) => (toggleIndex.get(node.id) || []).includes(toggleId));

  return last(entriesInToggle);
};
