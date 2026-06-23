import type { DeserializeMdOptions } from '@platejs/markdown';
import type { Element } from '@platejs/slate';
import { getPluginType, KEYS, TextApi } from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';
import type { AIChatPlateEditor } from '../internal/editorTypes';
import { getChunkTrimmed } from './utils';
import { escapeInput } from './utils/escapeInput';

const statMdxTagRegex = /<([A-Za-z][A-Za-z0-9._:-]*)(?:\s[^>]*?)?(?<!\/)>/;

export const streamDeserializeMd = (
  editor: AIChatPlateEditor,
  data: string,
  options?: DeserializeMdOptions
) => {
  const input = escapeInput(data);

  const value = withoutDeserializeInMdx(editor, input);

  if (Array.isArray(value)) return value;

  let blocks: Element[] = [];

  blocks = editor.api.markdown.deserialize(input, {
    ...options,
    preserveEmptyParagraphs: false,
  });

  const trimmedData = getChunkTrimmed(data);

  const lastBlock = blocks.at(-1) as Element | undefined;

  const addNewLine = trimmedData === '\n\n';
  const unshiftNewLine =
    getChunkTrimmed(data, { direction: 'left' }) === '\n\n';

  const isCodeBlockOrTable =
    lastBlock?.type === 'code_block' || lastBlock?.type === 'table';

  let result = blocks;

  /**
   * Deserialize the sting like `123\n\n` will be `123` base on markdown spec
   * but we want to keep the `\n\n`
   */

  if (
    lastBlock &&
    !isCodeBlockOrTable &&
    trimmedData.length > 0 &&
    !addNewLine
  ) {
    const textNode = [
      {
        text: trimmedData,
      },
    ];

    const lastChild = lastBlock.children.at(-1);

    /** It’s like normalizing and merging the text nodes. */
    if (
      lastChild &&
      TextApi.isText(lastChild) &&
      Object.keys(lastChild).length === 1
    ) {
      lastBlock.children.pop();

      const textNode = [
        {
          text: lastChild.text + trimmedData,
        },
      ];

      lastBlock.children.push(...textNode);
    } else {
      lastBlock.children.push(...textNode);
    }

    result = [...blocks.slice(0, -1), lastBlock];
  }

  if (addNewLine && !isCodeBlockOrTable) {
    result.push({
      children: [{ text: '' }],
      type: KEYS.p,
    });
  }

  if (unshiftNewLine && !isCodeBlockOrTable) {
    result.unshift({
      children: [{ text: '' }],
      type: KEYS.p,
    });
  }

  return result;
};

const withoutDeserializeInMdx = (editor: AIChatPlateEditor, input: string) => {
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
