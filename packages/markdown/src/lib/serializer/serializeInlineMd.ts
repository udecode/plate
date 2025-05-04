import type { SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { SerializeMdOptions } from './serializeMd';

import { convertTextsSerialize } from './convertTextsSerialize';
import { getMergedOptionsSerialize } from './utils';

export const serializeInlineMd = (
  editor: SlateEditor,
  options?: SerializeMdOptions
) => {
  const mergedOptions = getMergedOptionsSerialize(editor, options);

  const toRemarkProcessor = unified()
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
    });

  if (options?.value?.length === 0) return '';

  const convertedTexts = convertTextsSerialize(mergedOptions.value as any, {});

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertedTexts,
    type: 'root',
  });

  return serializedContent;
};
