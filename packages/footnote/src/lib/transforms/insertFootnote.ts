import type { InsertNodesOptions, SlateEditor, TElement, TNode } from 'platejs';

import { KEYS } from 'platejs';

import { getNextFootnoteIdentifier } from '../queries/getNextFootnoteIdentifier';
import { createFootnoteDefinition } from './createFootnoteDefinition';
import { focusFootnoteDefinition } from './focusFootnoteDefinition';
import { getFootnoteReferenceSelectionPoint } from './focusFootnoteReference';

export type InsertFootnoteOptions = InsertNodesOptions & {
  focusDefinition?: boolean;
  identifier?: string;
};

export const insertFootnote = (
  editor: SlateEditor,
  {
    focusDefinition: shouldFocusDefinition = true,
    identifier,
    ...options
  }: InsertFootnoteOptions = {}
) => {
  if (!editor.selection) return;

  const selectionBefore = structuredClone(editor.selection);
  const nextIdentifier = identifier ?? getNextFootnoteIdentifier(editor);
  const fragment = editor.api.isExpanded()
    ? (editor.api.fragment(editor.selection) as TNode[])
    : undefined;
  const referenceType = editor.getType(KEYS.footnoteReference);
  let referencePath: number[] | undefined;

  editor.tf.withoutNormalizing(() => {
    editor.tf.insertNodes<TElement>(
      {
        children: [{ text: '' }],
        identifier: nextIdentifier,
        type: referenceType,
      },
      options as any
    );

    createFootnoteDefinition(editor, {
      focus: false,
      fragment,
      identifier: nextIdentifier,
    });

    const anchorPath = selectionBefore.anchor.path;
    const childIndex = anchorPath.at(-1);

    if (childIndex !== undefined) {
      referencePath = anchorPath.slice(0, -1).concat([childIndex + 1]);
    }
  });

  if (shouldFocusDefinition) {
    focusFootnoteDefinition(editor, { identifier: nextIdentifier });

    return;
  }

  if (referencePath) {
    const point = getFootnoteReferenceSelectionPoint(editor, referencePath);

    if (point) {
      editor.tf.select({
        anchor: point,
        focus: point,
      });
    }
  }
};
