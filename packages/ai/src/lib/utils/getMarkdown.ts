import { serializeMd } from '@platejs/markdown';
import { type TElement, KEYS, NodeEntry, SlateEditor } from 'platejs';

// Internal
export const getMarkdown = (
  editor: SlateEditor,
  {
    type,
    blockIds,
  }: {
    type:
      | 'editor'
      | 'editorWithBlockId'
      | 'block'
      | 'blockWithBlockId'
      | 'selection';
    blockIds: string[];
  }
) => {
  if (type === 'editor') {
    return serializeMd(editor);
  }
  if (type === 'editorWithBlockId') {
    return serializeMd(editor, { withBlockId: true });
  }

  if (type === 'block') {
    const blocks = editor.api.nodes({
      at: [],
      match: (n) => blockIds.includes(n.id as string),
      mode: 'highest',
    });

    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes });
  }

  if (type === 'blockWithBlockId') {
    const blocks = editor.api.nodes({
      at: [],
      match: (n) => blockIds.includes(n.id as string),
      mode: 'highest',
    });
    const nodes = Array.from(blocks, (entry) => entry[0]);

    return serializeMd(editor, { value: nodes, withBlockId: true });
  }

  if (type === 'selection') {
    const fragment = editor.api.fragment<TElement>();

    // Remove any block formatting
    if (fragment.length === 1) {
      const modifiedFragment = [
        {
          children: fragment[0].children,
          type: KEYS.p,
        },
      ];

      return serializeMd(editor, { value: modifiedFragment });
    }

    return serializeMd(editor, { value: fragment });
  }

  return '';
};
