import { isBlockAboveEmpty, setNodes } from '@udecode/plate-common';
import {
  getInlineTypes,
  PlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

export const insertDeserializedFragment = <
  T extends SPEditor = SPEditor & ReactEditor
>(
  editor: T,
  {
    fragment,
    plugins,
  }: {
    fragment: TDescendant[];
    plugins: PlatePlugin<T>[];
  }
) => {
  Editor.withoutNormalizing(editor, () => {
    plugins.forEach(({ deserialize }) => {
      const getFragment = deserialize?.(editor).getFragment;
      if (!getFragment) return;

      fragment = getFragment(fragment);
    });

    if (!fragment.length) return;

    const preInserted = plugins.some(({ deserialize }) => {
      return deserialize?.(editor).preInsert?.(fragment) === true;
    });

    if (!preInserted) {
      const inlineTypes = getInlineTypes(editor, plugins);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (
        isBlockAboveEmpty(editor) &&
        firstNodeType &&
        !inlineTypes.includes(firstNodeType) &&
        fragment[0].type
      ) {
        setNodes<TElement>(editor, { type: firstNodeType });
      }
    }

    editor.insertFragment(fragment);
  });
};
