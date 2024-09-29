'use client';
import type { PlateEditor } from '@udecode/plate-core/react';

import {
  ACTION_CONTINUE_WRITE,
  ACTION_EXPLAIN,
  ACTION_SUMMARIZE,
  GROUP_LANGUAGES,
} from '@/registry/default/plate-ui/ai-actions';
import { streamInsertText } from '@/registry/default/plate-ui/stream';
import { serializeAI } from '@/registry/default/plate-ui/utils';

import type { ActionHandlerOptions } from './useActionHandler';

export const defaultActionHandler = async (
  editor: PlateEditor,
  { group, value }: ActionHandlerOptions
) => {
  if (group === GROUP_LANGUAGES) {
    const content = serializeAI(editor);
    await streamInsertText(editor, {
      prompt: `Keep the original paragraph format. Translate the following article to ${value?.slice(7)}: ${content}`,
    });

    return;
  }

  switch (value) {
    case ACTION_CONTINUE_WRITE: {
      const content = serializeAI(editor);

      await streamInsertText(editor, {
        prompt: `Continue writing the following article in 3-5 sentences: ${content}`,
      });

      break;
    }
    case ACTION_SUMMARIZE: {
      const content = serializeAI(editor);

      await streamInsertText(editor, {
        prompt: `Summarize the following article in 3-5 sentences: ${content}`,
      });

      break;
    }
    case ACTION_EXPLAIN: {
      const content = serializeAI(editor);

      await streamInsertText(editor, {
        prompt: `Explain the following article in 3-5 sentences: ${content}`,
      });

      break;
    }
  }
};
