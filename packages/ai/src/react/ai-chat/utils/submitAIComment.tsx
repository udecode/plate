import type { PlateEditor } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';
import { type EditorPrompt, getEditorPrompt } from './getEditorPrompt';

export const submitAIComment = (
  editor: PlateEditor,
  commentPrompt: EditorPrompt = 'Please comment on the following content and provide reasonable and meaningful feedback'
) => {
  const { chat, commentPromptTemplate } = editor.getOptions(AIChatPlugin);

  const aiCommentPrompt = getEditorPrompt(editor, {
    prompt: commentPrompt,
    promptTemplate: commentPromptTemplate,
  })!;

  chat.sendMessage(
    { text: aiCommentPrompt },
    {
      body: { commentPrompt: aiCommentPrompt },
    }
  );
};
