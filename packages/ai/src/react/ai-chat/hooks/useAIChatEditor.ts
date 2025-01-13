import { useEffect, useMemo } from 'react';

import {
  type CreatePlateEditorOptions,
  useEditorPlugin,
  usePlateEditor,
} from '@udecode/plate/react';
import {
  type DeserializeMdOptions,
  MarkdownPlugin,
} from '@udecode/plate-markdown';

import { AIChatPlugin } from '../AIChatPlugin';

/**
 * Creates an editor, registers in the AI chat plugin, and deserializes the
 * content into `editor.children` with block-level memoization.
 */
export const useAIChatEditor = (
  content: string,
  {
    parser,
    processor,
    ...options
  }: {} & Partial<CreatePlateEditorOptions> & DeserializeMdOptions = {}
) => {
  const { setOption } = useEditorPlugin(AIChatPlugin);

  const editor = usePlateEditor(options);

  editor.children = useMemo(
    () =>
      editor.getApi(MarkdownPlugin).markdown.deserialize(content, {
        memoize: true,
        parser,
        processor,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content]
  );

  useEffect(() => {
    setOption('aiEditor', editor);
  }, [editor, setOption]);

  return editor;
};
