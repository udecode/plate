import { Editor } from 'slate';
import { getBlockAboveSelection } from './getBlockAboveSelection';
import { getText } from './getText';

/**
 * Get the block text before the selection: from the start of the block to the anchor.
 * Return the text and its range.
 */
export const getTextFromBlockStartToAnchor = (editor: Editor) => {
  const { selection } = editor;

  if (!selection) return { text: '' };

  const [, path] = getBlockAboveSelection(editor);

  const start = Editor.start(editor, path);
  const range = { anchor: start, focus: selection.anchor };

  return {
    text: getText(editor, range),
    range,
  };
};
