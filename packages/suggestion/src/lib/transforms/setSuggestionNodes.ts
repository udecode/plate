import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeProps,
  addRangeMarks,
  getNodeEntries,
  isInline,
  nanoid,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { SuggestionEditorProps, TSuggestionText } from '../types';

import { getSuggestionProps } from './getSuggestionProps';

export const setSuggestionNodes = (
  editor: SlateEditor & SuggestionEditorProps,
  options?: {
    suggestionDeletion?: boolean;
    suggestionId?: string;
  } & SetNodesOptions
) => {
  const { at = editor.selection, suggestionId = nanoid() } = options ?? {};

  // TODO: get all inline nodes to be set
  const _nodeEntries = getNodeEntries(editor, {
    match: (n) => isInline(editor, n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  withoutNormalizing(editor, () => {
    const props: TNodeProps<TSuggestionText> = getSuggestionProps(
      editor,
      suggestionId,
      options
    );

    addRangeMarks(editor, props, {
      at,
    });

    nodeEntries.forEach(([, path]) => {
      setNodes<TSuggestionText>(editor, props, {
        at: path,
        match: (n) => {
          if (!isInline(editor, n)) return false;

          return true;
        },
        ...options,
      });
    });
  });
};
