import type { SlateEditor, TElement, TNode } from 'platejs';

import { KEYS } from 'platejs';
import { getFootnoteDefinition } from '../queries/getFootnoteDefinition';
import { focusFootnoteDefinition } from './focusFootnoteDefinition';

export type CreateFootnoteDefinitionOptions = {
  focus?: boolean;
  fragment?: TNode[];
  identifier: string;
};

const getDefinitionChildren = (
  editor: SlateEditor,
  { fragment }: { fragment?: TNode[] }
) => {
  const paragraphType = editor.getType(KEYS.p);
  const clonedFragment = fragment ? structuredClone(fragment) : [];
  const blocks =
    clonedFragment.length > 0
      ? clonedFragment.map((child: any) =>
          child.type === paragraphType
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
  editor: SlateEditor,
  {
    focus: shouldFocusDefinition = true,
    fragment,
    identifier,
  }: CreateFootnoteDefinitionOptions
) => {
  const existingDefinition = getFootnoteDefinition(editor, { identifier });

  if (existingDefinition) {
    if (shouldFocusDefinition) {
      focusFootnoteDefinition(editor, { identifier });
    }

    return existingDefinition[1];
  }

  const definitionPath = [editor.children.length];

  editor.tf.insertNodes<TElement>(
    {
      children: getDefinitionChildren(editor, {
        fragment,
      }) as any,
      identifier,
      type: editor.getType(KEYS.footnoteDefinition),
    },
    { at: definitionPath }
  );

  if (shouldFocusDefinition) {
    focusFootnoteDefinition(editor, { identifier });
  }

  return definitionPath;
};
