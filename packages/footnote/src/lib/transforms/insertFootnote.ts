import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  Path,
} from '@platejs/plite';
import { PathApi } from '@platejs/plite';

import { getNextFootnoteIdentifier } from '../queries/getNextFootnoteIdentifier';
import type { TFootnoteElement } from '../types';
import { createFootnoteDefinition } from './createFootnoteDefinition';

export type InsertFootnoteOptions = NodeInsertNodesOptions<TFootnoteElement> & {
  focusDefinition?: boolean;
  identifier?: string;
};

export const insertFootnote = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  referenceType: string,
  {
    focusDefinition: shouldFocusDefinition = true,
    identifier,
    ...options
  }: InsertFootnoteOptions = {}
) => {
  const selection = tx.selection();

  if (!selection && options.at === undefined) return;

  const nextIdentifier = identifier ?? getNextFootnoteIdentifier(editor);
  const fragment =
    selection && tx.selection.isExpanded()
      ? tx.fragment({ at: selection })
      : undefined;
  const reference: TFootnoteElement = {
    children: [{ text: '' }],
    identifier: nextIdentifier,
    type: referenceType,
  };
  let referencePath: Path | undefined;

  if (selection && options.at === undefined) {
    const childIndex = selection.anchor.path.at(-1);

    if (childIndex !== undefined) {
      referencePath = selection.anchor.path.slice(0, -1).concat(childIndex + 1);
    }
  }

  tx.nodes.insert(reference, options);

  createFootnoteDefinition(editor, tx, {
    focus: shouldFocusDefinition,
    fragment,
    identifier: nextIdentifier,
  });

  if (shouldFocusDefinition) {
    return;
  }

  if (referencePath) {
    const point = { offset: 0, path: PathApi.next(referencePath) };

    tx.nodes.insert({ text: '' }, { at: point.path });

    tx.selection.set({
      anchor: point,
      focus: point,
    });
  }
};
