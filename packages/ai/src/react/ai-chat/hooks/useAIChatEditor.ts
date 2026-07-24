import { useEffect, useMemo } from 'react';

import type { MarkdownEditor } from '@platejs/markdown';
import {
  type PlateEditor,
  useEditorPlugin,
  useEditorRuntimeState,
} from '@platejs/core/react';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Register an editor in the AI chat plugin and deserialize content into it.
 *
 * @returns The live editor children after each committed content update.
 */
export const useAIChatEditor = (
  editor: MarkdownEditor<PlateEditor>,
  content: string
) => {
  const { setOption } = useEditorPlugin(AIChatPlugin);

  const document = useMemo(
    () => editor.api.markdown.deserialize(content),
    [content, editor]
  );
  const value = useEditorRuntimeState(editor, (state) => state.children());

  useEffect(() => {
    editor.update({ history: 'skip' }).value.replace(document);
    setOption('aiEditor', editor);
  }, [document, editor, setOption]);

  return value;
};
