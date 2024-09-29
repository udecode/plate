import type { PlateEditor } from '@udecode/plate-core/react';

import {
  ACTION_SELECTION_FIX_SPELLING,
  ACTION_SELECTION_IMPROVE_WRITING,
  ACTION_SELECTION_MAKE_LONGER,
  ACTION_SELECTION_MAKE_SHORTER,
  ACTION_SELECTION_SIMPLIFY_LANGUAGE,
  GROUP_SELECTION_LANGUAGES,
} from '@/registry/default/plate-ui/ai-actions';
import { streamInsertTextSelection } from '@/registry/default/plate-ui/stream';
import { getContent } from '@/registry/default/plate-ui/utils';

import type { ActionHandlerOptions } from './useActionHandler';

export const selectionActionHandler = (
  editor: PlateEditor,
  aiEditor: PlateEditor,
  { group, value }: ActionHandlerOptions
) => {
  if (group === GROUP_SELECTION_LANGUAGES) {
    const content = getContent(editor, aiEditor);
    aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

    void streamInsertTextSelection(editor, aiEditor, {
      prompt: `translate the following article to ${value?.slice(7)}: ${content} Please keep the original paragraph format.`,
    });

    return;
  }

  switch (value) {
    case ACTION_SELECTION_IMPROVE_WRITING: {
      const content = getContent(editor, aiEditor);
      aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `improve the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_FIX_SPELLING: {
      const content = getContent(editor, aiEditor);
      aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `Correct the grammatical or spelling errors in the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_MAKE_SHORTER: {
      const content = getContent(editor, aiEditor);
      aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `make shorter with the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_MAKE_LONGER: {
      const content = getContent(editor, aiEditor);
      aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `make longer with the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_SIMPLIFY_LANGUAGE: {
      const content = getContent(editor, aiEditor);
      aiEditor.children = [{ children: [{ text: '' }], type: 'p' }];

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `Simplify the language in the following content: ${content}`,
      });
    }
  }
};
