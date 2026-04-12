import type { PlateEditor } from 'platejs/react';

import {
  type DeserializeMdOptions,
  MarkdownPlugin,
  markdownToSlateNodesSafely,
  splitIncompleteMdx,
} from '@platejs/markdown';
import { type Descendant, TextApi, getPluginType, KEYS } from 'platejs';

import {
  getMarkdownStreamMdxName,
  setMarkdownStreamMdxName,
} from './markdownStreamSession';
import { remarkStreamdownPendingTail } from './remarkStreamdownPendingTail';
import { escapeInput } from './utils/escapeInput';

const statMdxTagRegex = /<([A-Za-z][A-Za-z0-9._:-]*)(?:\s[^>]*?)?(?<!\/)>/;

const getPendingMdxName = (input: string) => {
  const result = splitIncompleteMdx(input);

  if (!Array.isArray(result)) return null;

  const incompleteString = result[1];
  const pendingMdxName = statMdxTagRegex.exec(incompleteString)?.[1];

  if (pendingMdxName && incompleteString.startsWith(`<${pendingMdxName}`)) {
    return pendingMdxName;
  }

  return null;
};

const toBlockNodes = (editor: PlateEditor, value: Descendant[]) =>
  value.map((item) =>
    TextApi.isText(item)
      ? {
          children: [item],
          type: getPluginType(editor, KEYS.p),
        }
      : item
  );

export const streamDeserializeMd = (
  editor: PlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const input = escapeInput(data);
  const pluginRemarkPlugins =
    editor.getOptions(MarkdownPlugin).remarkPlugins ?? [];
  const remarkPlugins = [
    ...pluginRemarkPlugins,
    remarkStreamdownPendingTail,
    ...(options?.remarkPlugins ?? []),
  ];

  const value = withoutDeserializeInMdx(editor, input, {
    ...options,
    remarkPlugins,
  });

  if (Array.isArray(value)) return toBlockNodes(editor, value);

  setMarkdownStreamMdxName(editor, getPendingMdxName(input));

  return toBlockNodes(
    editor,
    editor.getApi(MarkdownPlugin).markdown.deserialize(input, {
      ...options,
      preserveEmptyParagraphs: false,
      remarkPlugins,
    })
  );
};

const withoutDeserializeInMdx = (
  editor: PlateEditor,
  input: string,
  options?: DeserializeMdOptions
) => {
  const mdxName = getMarkdownStreamMdxName(editor);

  if (!mdxName) return false;

  const pendingMdxName = getPendingMdxName(input);

  if (pendingMdxName !== mdxName) {
    setMarkdownStreamMdxName(editor, pendingMdxName);
    return false;
  }

  const splitResult = splitIncompleteMdx(input);

  if (Array.isArray(splitResult) && splitResult[0].length > 0) {
    return markdownToSlateNodesSafely(editor, input, options);
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
};
