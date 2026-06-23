import type { Element, NodeEntry } from '@platejs/plite';
import { type BasePlateEditor, KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';

export const toggleListByPath = (
  editor: BasePlateEditor,
  [node, path]: NodeEntry<Element>,
  listStyleType: string
) => {
  const nodeProps = node as Record<string, unknown>;

  editor.update((tx) => {
    tx.nodes.set(
      {
        [KEYS.indent]: nodeProps.indent ?? 1,
        // TODO: normalized if not todo remove this property.
        [KEYS.listChecked]: false,
        [KEYS.listType]: listStyleType,
        type: KEYS.p,
      },
      {
        at: path,
      }
    );
  });

  normalizeListSequence(editor, path);
};

export const toggleListByPathUnSet = (
  editor: BasePlateEditor,
  entry: NodeEntry<Element>
) => {
  const [node, path] = entry;

  editor.update((tx) => {
    tx.nodes.unset([KEYS.listType, KEYS.indent, KEYS.listChecked], {
      at: path,
    });
  });

  normalizeListSequence(editor, [node, path]);
};
