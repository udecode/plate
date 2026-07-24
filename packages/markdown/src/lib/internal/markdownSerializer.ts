import type { Descendant, Text } from '@platejs/plite';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import type { MdRoot } from '../mdast';
import type { SerializeMdOptions } from '../serializer/serializeMd';
import type { SerializeMdContext } from '../types';
import type { MarkdownRuntime } from './markdownRuntime';
import type { MarkdownSerializeDocumentValue } from './markdownDocument';

import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import { convertTextsSerialize } from '../serializer/convertTextsSerialize';
import { getMergedOptionsSerialize } from './markdownOptions';

export const serializeMdWithRuntime = (
  runtime: MarkdownRuntime,
  options?: SerializeMdOptions,
  document?: MarkdownSerializeDocumentValue
) => {
  const mergedOptions = getMergedOptionsSerialize(runtime, options, document);
  const { remarkPlugins, value } = mergedOptions;
  const toRemarkProcessor = unified()
    .use(remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      resourceLink: false,
      ...mergedOptions.remarkStringifyOptions,
    });
  const mdast = slateToMdast(value!, mergedOptions);

  return toRemarkProcessor.stringify(mdast);
};

export const serializeInlineMdWithRuntime = (
  runtime: MarkdownRuntime,
  options?: Omit<SerializeMdOptions, 'value'> & { value?: readonly Text[] }
) => {
  const { value = [], ...serializeOptions } = options ?? {};
  const mergedOptions = getMergedOptionsSerialize(runtime, serializeOptions, {
    children: value,
  });
  const toRemarkProcessor = unified()
    .use(mergedOptions.remarkPlugins ?? [])
    .use(remarkStringify, {
      emphasis: '_',
      ...mergedOptions.remarkStringifyOptions,
    });

  if (value.length === 0) return '';

  return toRemarkProcessor.stringify({
    children: convertTextsSerialize(value, mergedOptions),
    type: 'root',
  });
};

const slateToMdast = (
  children: readonly Descendant[],
  options: SerializeMdContext
): MdRoot => ({
  children: convertNodesSerialize(
    children,
    options,
    true
  ) as MdRoot['children'],
  type: 'root',
});
