import { useEffect, useMemo } from 'react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import { type PlateEditor, useEditorPlugin } from '@platejs/core/react';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Register an editor in the AI chat plugin, and deserializes the content into
 * `editor.children` with block-level memoization.
 *
 * @returns Deserialized children to pass as `value` prop to PlateStatic
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

  useEffect(() => {
    editor.update.value.replace(
      { children },
      { history: 'skip', normalize: false }
    );
    setOption('aiEditor', editor);
  }, [children, editor, setOption]);

  return children;
};
