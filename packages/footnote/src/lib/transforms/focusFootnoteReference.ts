import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Element,
  type Point,
  TextApi,
} from '@platejs/plite';

import { navigateToFootnote } from '../../internal/navigateToFootnote';
import { getFootnoteReferences } from '../queries/getFootnoteReferences';

export const getFootnoteReferenceSelectionPoint = (
  tx: EditorUpdateTransaction,
  path: number[]
) => {
  const parentEntry = tx.nodes.parent<Element>(path);

  let point: Point | undefined;

  if (parentEntry) {
    const [parent, parentPath] = parentEntry;
    const childIndex = path.at(-1) ?? -1;
    const nextSibling = parent.children[childIndex + 1];
    const previousSibling = parent.children[childIndex - 1];

    if (TextApi.isText(nextSibling)) {
      point = {
        offset: 0,
        path: parentPath.concat([childIndex + 1]),
      };
    } else if (TextApi.isText(previousSibling)) {
      point = {
        offset: previousSibling.text.length,
        path: parentPath.concat([childIndex - 1]),
      };
    }
  }

  point ??= tx.points.start(path.concat([0]));

  return point;
};

export const focusFootnoteReference = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    identifier,
    index = 0,
  }: {
    identifier: string;
    index?: number;
  }
) => {
  const reference = getFootnoteReferences(editor, { identifier })[index];

  if (!reference) return false;

  const point = getFootnoteReferenceSelectionPoint(tx, reference[1]);

  if (!point) return false;

  return navigateToFootnote(editor, tx, {
    point,
    targetPath: reference[1],
  });
};
