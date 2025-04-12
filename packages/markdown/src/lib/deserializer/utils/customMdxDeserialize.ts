import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import type { DeserializeMdOptions } from '../deserializeMd';
import type { Decoration } from '../type';

import { getDeserializerByKey } from './getDeserializerByKey';

export const customMdxDeserialize = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement,
  deco: Decoration,
  options: DeserializeMdOptions
) => {
  /** Handle custom mdx nodes */
  if (mdastNode.name === 'br') {
    const parserKey = mdastNode.name;
    const nodeParserDeserialize = getDeserializerByKey(parserKey, options);

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options);

    return [{ text: '\n' }];
  }

  if (mdastNode.name === 'u') {
    const parserKey = 'underline';

    const nodeParserDeserialize = getDeserializerByKey(parserKey, options);

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
  }

  const customJsxElementKey = mdastNode.name;

  if (customJsxElementKey) {
    const nodeParserDeserialize = getDeserializerByKey(
      customJsxElementKey,
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
  }
};
