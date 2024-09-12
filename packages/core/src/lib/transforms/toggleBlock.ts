import {
  type GetNodeEntriesOptions,
  type TElement,
  someNode,
} from '@udecode/slate';

import type { SlateEditor } from '../editor';

import { BaseParagraphPlugin, type ToggleBlockOptions } from '../plugins';

/**
 * Toggle the type of the selected block. If the block is not of the specified
 * type, it will be changed to that type. Otherwise, it will be changed to the
 * default type.
 */
export const toggleBlock = <E extends SlateEditor = SlateEditor>(
  editor: E,
  options: ToggleBlockOptions,
  editorNodesOptions?: Omit<GetNodeEntriesOptions<E>, 'match'>
) => {
  const { defaultType = editor.getType(BaseParagraphPlugin), type } = options;

  const at = editorNodesOptions?.at ?? editor.selection;

  if (!type || !at) return;

  const isActive = someNode(editor, {
    ...editorNodesOptions,
    match: {
      type: type,
    },
  });

  if (isActive && type === defaultType) return;

  editor.setNodes<TElement>(
    {
      type: isActive ? defaultType : type,
    },
    { at: at as any }
  );
};
