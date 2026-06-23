import type { Element, NodeEntry } from '@platejs/slate';
import { type SlateEditor, KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';

export const toggleListByPath = (
  editor: SlateEditor,
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
  editor: SlateEditor,
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
