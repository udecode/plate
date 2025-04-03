import type { SlateEditor } from '@udecode/plate';

import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { SerializeMdOptions } from './serializeMd';

import { convertTexts } from './convertTexts';
import { getMergedOptionsSerialize } from './utils/getMergedOptions';

export const serializeInlineMd = (
  editor: SlateEditor,
  options?: SerializeMdOptions
) => {
  const mergedOptions = getMergedOptionsSerialize(editor, options);

  const toRemarkProcessor = unified()
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkStringify);

  if (options?.value?.length === 0) return '';

  // Serialize the content
  const serializedContent = toRemarkProcessor.stringify({
    children: convertTexts(mergedOptions.value as any, {}),
    type: 'root',
  });

  return serializedContent;
};
