import { useEffect, useMemo } from 'react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import {
  type PlateEditor,
  useEditorPlugin,
  useEditorRuntimeState,
} from '@platejs/core/react';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Register an editor in the AI chat plugin, and deserializes the content into
 * the editor with block-level memoization.
 *
 * @returns The live editor children after each committed content update.
 */
export const useAIChatEditor = (
  editor: PlateEditor,
  content: string,
  { parser }: DeserializeMdOptions = {}
) => {
  const { setOption } = useEditorPlugin(AIChatPlugin);

  const children = useMemo(
    () =>
      editor.plugin(MarkdownPlugin).api.deserialize(content, {
        memoize: true,
        parser,
      }),
    [content, editor, parser]
  );
  const value = useEditorRuntimeState(editor, (state) => state.children(), {
    deps: [],
  });

  useEffect(() => {
    editor.update({ history: 'skip' }).value.replace({ children });
    setOption('aiEditor', editor);
  }, [children, editor, setOption]);

  return value;
};
