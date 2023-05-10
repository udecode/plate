import {
  addRangeMarks,
  getNodeEntries,
  isInline,
  nanoid,
  PlateEditor,
  setNodes,
  SetNodesOptions,
  TNodeProps,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from './constants';
import { SuggestionEditorProps, TSuggestionText } from './types';

export const setSuggestionNodes = <V extends Value = Value>(
  editor: PlateEditor<V> & SuggestionEditorProps,
  options?: SetNodesOptions & {
    suggestionDeletion?: boolean;
    suggestionId?: string;
  }
) => {
  const { at = editor.selection, suggestionId = nanoid() } = options ?? {};

  // TODO: get all inline nodes to be set
  const _nodeEntries = getNodeEntries(editor, {
    match: (n) => isInline(editor, n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  withoutNormalizing(editor, () => {
    const props: TNodeProps<TSuggestionText> = {
      [MARK_SUGGESTION]: true,
      [KEY_SUGGESTION_ID]: suggestionId,
    };
    if (options?.suggestionDeletion) {
      props.suggestionDeletion = true;
    }

    addRangeMarks(editor, props, {
      at,
    });

    nodeEntries.forEach(([, path]) => {
      setNodes<TSuggestionText>(
        editor,
        { ...props },
        {
          at: path,
          match: (n) => {
            if (!isInline(editor, n)) return false;

            // if (n[MARK_SUGGESTION]) {
            // }

            return true;
          },
          ...options,
        }
      );
    });
  });
};
