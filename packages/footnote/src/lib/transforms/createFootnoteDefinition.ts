import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type EditorUpdateTransaction,
  ElementApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { getFootnoteDefinition } from '../queries/getFootnoteDefinition';
import type { TFootnoteElement } from '../types';
import { focusFootnoteDefinition } from './focusFootnoteDefinition';

export type CreateFootnoteDefinitionOptions = {
  focus?: boolean;
  fragment?: Descendant[];
  identifier: string;
};

const getDefinitionChildren = (
  editor: BaseEditor,
  { fragment }: { fragment?: Descendant[] }
) => {
  const paragraphType = editor.getType(KEYS.p);
  const clonedFragment = fragment ? structuredClone(fragment) : [];
  const blocks =
    clonedFragment.length > 0
      ? clonedFragment.map((child) =>
          ElementApi.isElement(child) && child.type === paragraphType
            ? child
            : {
                children: [child],
                type: paragraphType,
              }
        )
      : [{ children: [{ text: '' }], type: paragraphType }];

  return blocks;
};

export const createFootnoteDefinition = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    focus: shouldFocusDefinition = true,
    fragment,
    identifier,
  }: CreateFootnoteDefinitionOptions
) => {
  const existingDefinition = getFootnoteDefinition(editor, { identifier }, tx);

  if (existingDefinition) {
    if (shouldFocusDefinition) {
      focusFootnoteDefinition(editor, tx, { identifier });
    }

    return existingDefinition[1];
  }

  const definitionPath = [tx.value().children.length];

  tx.nodes.insert<TFootnoteElement>(
    {
      children: getDefinitionChildren(editor, { fragment }),
      identifier,
      type: editor.getType(KEYS.footnoteDefinition),
    },
    { at: definitionPath }
  );

  if (shouldFocusDefinition) {
    focusFootnoteDefinition(editor, tx, { identifier });
  }

  return definitionPath;
};
