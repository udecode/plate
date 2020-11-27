import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { BlockQuoteOptions, getParent } from '../..';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_BLOCKQUOTE, ELEMENT_BLOCKQUOTE } from './defaults';

export const withBlockquote = (options?: BlockQuoteOptions) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { p } = setDefaults(options, DEFAULTS_BLOCKQUOTE);
  const { insertText } = editor;

  editor.insertText = (node) => {
    if (!editor.selection) return;

    // Get the parent of our current selection
    const selectionParentEntry = getParent(editor, editor.selection);
    if (!selectionParentEntry) return;

    const [elem, elemPath] = selectionParentEntry;

    // If the direct parent is a node of ELEMENT_BLOCKQUOTE type
    if (elem?.type === ELEMENT_BLOCKQUOTE) {
      const blockedQuoteChildren = {
        type: p.type,
        children: [{ text: node }],
      };

      // Let's add a new <p> node
      // at the current <blockquote>
      // to enriched it
      return Transforms.insertNodes(editor, blockedQuoteChildren, {
        at: [...elemPath, 0],
      });
    }

    insertText(node);
  };
  return editor;
};
