import type { PlateEditor } from 'platejs/react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';
import { getPluginType, KEYS } from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';
import { remarkStreamdownPendingTail } from './remarkStreamdownPendingTail';
import { escapeInput } from './utils/escapeInput';

const statMdxTagRegex = /<([A-Za-z][A-Za-z0-9._:-]*)(?:\s[^>]*?)?(?<!\/)>/;

export const streamDeserializeMd = (
  editor: PlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const input = escapeInput(data);

  const value = withoutDeserializeInMdx(editor, input);

  if (Array.isArray(value)) return value;

  const pluginRemarkPlugins =
    editor.getOptions(MarkdownPlugin).remarkPlugins ?? [];

  return editor.getApi(MarkdownPlugin).markdown.deserialize(input, {
    ...options,
    preserveEmptyParagraphs: false,
    remarkPlugins: [
      ...pluginRemarkPlugins,
      remarkStreamdownPendingTail,
      ...(options?.remarkPlugins ?? []),
    ],
  });
};

const withoutDeserializeInMdx = (editor: PlateEditor, input: string) => {
  const mdxName = editor.getOption(AIChatPlugin, '_mdxName');

  if (mdxName) {
    const isMdxEnd = input.includes(`</${mdxName}>`);

    if (isMdxEnd) {
      editor.setOption(AIChatPlugin, '_mdxName', null);
      return false;
    }
    return [
      {
        children: [
          {
            text: input,
          },
        ],
        type: getPluginType(editor, KEYS.p),
      },
    ];
  }
  const newMdxName = statMdxTagRegex.exec(input)?.[1];

  // Avoid incorrect detection in the code block
  if (input.startsWith(`<${newMdxName}`)) {
    editor.setOption(AIChatPlugin, '_mdxName', newMdxName ?? null);
  }
};
