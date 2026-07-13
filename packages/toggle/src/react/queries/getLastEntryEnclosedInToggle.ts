import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type NodeEntry,
  type Value,
  ElementApi,
} from '@platejs/plite';

import { buildToggleIndex } from '../toggleIndexAtom';

export const getLastEntryEnclosedInToggle = <V extends Value>(
  editor: BaseEditor<V>,
  toggleId: string
): NodeEntry<Element> | undefined => {
  const children = editor.read.children();
  const toggleIndex = buildToggleIndex(children);
  const entriesInToggle = children.flatMap((node, index) => {
    if (!ElementApi.isElement(node) || typeof node.id !== 'string') return [];

    return (toggleIndex.get(node.id) ?? []).includes(toggleId)
      ? ([[node, [index]]] satisfies NodeEntry<Element>[])
      : [];
  });

  return entriesInToggle.at(-1);
};
