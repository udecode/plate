import { useEffect, useMemo } from 'react';

import type { SlateEditor } from '@udecode/plate';

import {
  type DeserializeMdOptions,
  MarkdownPlugin,
} from '@udecode/plate-markdown';
import { useEditorPlugin } from '@udecode/plate/react';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Register an editor in the AI chat plugin, and deserializes the content into
 * `editor.children` with block-level memoization.
 */
export const useAIChatEditor = (
  editor: SlateEditor,
  content: string,
  { parser }: DeserializeMdOptions = {}
) => {
  const { setOption } = useEditorPlugin(AIChatPlugin);

  editor.children = useMemo(
    () => {
      return editor.getApi(MarkdownPlugin).markdown.deserialize(content, {
        memoize: true,
        parser,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );

  useEffect(() => {
    setOption('aiEditor', editor);
  }, [editor, setOption]);
};
