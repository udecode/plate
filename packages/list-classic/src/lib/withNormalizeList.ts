import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  ElementApi,
  PathApi,
} from '@platejs/plite';

import type { ListCorrectionTransaction } from './BaseListPlugin';

import { getListTypes } from './queries';

const mergeAdjacentList = (
  tx: ListCorrectionTransaction,
  fromList: ElementEntry,
  toList: ElementEntry
) => {
  const fromPath = fromList[1];
  const firstChildPath = [...fromPath, 0];

  if (fromList[0].children.length === 0) {
    tx.nodes.remove({ at: fromPath });

    return;
  }

  tx.nodes.move({
    at: firstChildPath,
    to: [...toList[1], toList[0].children.length],
  });
};

/** Maintain list-specific relationships not expressible by schema grammar. */
export const withNormalizeList = ({
  editor,
}: {
  editor: BaseEditor;
}): PlateEditorExtension => ({
  corrections: [
    {
      event: 'content',
      correct({ entry: [node, path], tx }) {
        if (!ElementApi.isElement(node)) {
          return;
        }

        const listTypes = getListTypes(editor);

        if (listTypes.includes(node.type)) {
          const nextPath = PathApi.next(path);
          const nextNode = tx.nodes.get<Element>(nextPath);

          if (nextNode?.[0].type === node.type) {
            mergeAdjacentList(tx, nextNode, [node, path]);
            return;
          }

          if (PathApi.hasPrevious(path)) {
            const prevNode = tx.nodes.get<Element>(PathApi.previous(path));

            if (prevNode?.[0].type === node.type) {
              mergeAdjacentList(tx, [node, path], prevNode);
              return;
            }
          }
        }
      },
    },
  ],
});
