import type { Descendant } from 'platejs';

import type { MdRootContent } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { customMdxDeserialize } from './utils';
import { shouldDeserializeNode } from './internal/shouldDeserializeNode';
import { getDeserializerByKey } from './utils/getDeserializerByKey';

const BR_HTML_REGEX = /^<br\s*\/?>$/i;
const LEADING_NEWLINE_REGEX = /^\n/;

// `<br>` is already the line break, so the source newline right after it is
// dropped. A soft break after any other node stays in the text.
const dropNewlineAfterBr = (
  node: MdRootContent,
  previous?: MdRootContent
): MdRootContent =>
  node.type === 'text' &&
  previous?.type === 'html' &&
  BR_HTML_REGEX.test(previous.value)
    ? { ...node, value: node.value.replace(LEADING_NEWLINE_REGEX, '') }
    : node;

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node, index) => {
    // Only process nodes that pass the filtering
    if (shouldDeserializeNode(node, options)) {
      const current = dropNewlineAfterBr(node, nodes[index - 1]);

      acc.push(...buildSlateNode(current, deco, options));
    }
    return acc;
  }, []);
};

export const buildSlateNode = (
  mdastNode: MdRootContent,
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  /** Handle custom mdx nodes */
  if (
    mdastNode.type === 'mdxJsxTextElement' ||
    mdastNode.type === 'mdxJsxFlowElement'
  ) {
    const result = customMdxDeserialize(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }

  const type = mdastToPlate(options.editor!, mdastNode.type);

  const nodeParser = getDeserializerByKey(type, options);

  if (nodeParser) {
    const result = nodeParser(mdastNode as any, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};
