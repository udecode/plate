import { useEffect, useMemo } from 'react';

import type { SlateEditor } from 'platejs';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import { useEditorPlugin } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Register an editor in the AI chat plugin, and deserializes the content into
 * `editor.children` with block-level memoization.
 *
 * @returns Deserialized children to pass as `value` prop to PlateStatic
 */
export const useAIChatEditor = (
  editor: SlateEditor,
  content: string,
  { parser }: DeserializeMdOptions = {}
) => {
  const { setOption } = useEditorPlugin(AIChatPlugin);

  const children = useMemo(
    () => {
      const result = editor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(content, {
          memoize: true,
          parser,
        });
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );

  editor.children = children;

  useEffect(() => {
    setOption('aiEditor', editor);
  }, [editor, setOption]);

  return children;
};
