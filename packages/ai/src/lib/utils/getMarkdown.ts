import { serializeMd } from '@platejs/markdown';
import { type SlateEditor, type TElement, KEYS } from 'platejs';

import type { MarkdownType } from './getEditorPrompt';

// Internal
export const getMarkdown = (
  editor: SlateEditor,
  {
    type,
  }: {
    type: MarkdownType;
  }
) => {
  if (type === 'editor' || type === 'editorWithBlockId') {
    return serializeMd(editor, {
      withBlockId: type === 'editorWithBlockId',
    });
  }

  if (type === 'block' || type === 'blockWithBlockId') {
    const blocks = editor.api.blocks({ mode: 'highest' }).map(([node]) => node);

    return serializeMd(editor, {
      value: blocks,
      withBlockId: type === 'blockWithBlockId',
    });
  }

  if (type === 'blockSelection' || type === 'blockSelectionWithBlockId') {
    const fragment = editor.api.fragment<TElement>();

    // Remove any block formatting
    if (fragment.length === 1) {
      const modifiedFragment = [
        {
          children: fragment[0].children,
          type: KEYS.p,
        },
      ];

      return serializeMd(editor, {
        value: modifiedFragment,
        withBlockId: type === 'blockSelectionWithBlockId',
      });
    }

    return serializeMd(editor, {
      value: fragment,
      withBlockId: type === 'blockSelectionWithBlockId',
    });
  }

  return '';
};
