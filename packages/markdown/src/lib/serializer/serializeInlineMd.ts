import type { BaseEditor } from '@platejs/core';
import type { Text } from '@platejs/plite';

import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { SerializeMdOptions } from './serializeMd';

import { convertTextsSerialize } from './convertTextsSerialize';
import { getMergedOptionsSerialize } from './utils';

export const serializeInlineMd = (
  editor: BaseEditor,
  options?: Omit<SerializeMdOptions, 'value'> & { value?: Text[] }
) => {
  const mergedOptions = getMergedOptionsSerialize(editor, options);

  const toRemarkProcessor = unified()
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      ...mergedOptions?.remarkStringifyOptions,
    });

  if (options?.value?.length === 0) return '';

  const convertedTexts = convertTextsSerialize(options?.value ?? [], {
    ...mergedOptions,
    editor,
  });

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertedTexts,
    type: 'root',
  });

  return serializedContent;
};
