import { getPluginKey, getPluginType } from '@platejs/core';
import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
} from '@platejs/plite';
import { KEYS, type TListElement } from '@platejs/utils';

import type { MdRootContent } from '../mdast';
import type { SerializeMdOptions } from './serializeMd';

import { convertTextsSerialize } from './convertTextsSerialize';
import { listToMdastTree } from './listToMdastTree';
import { unreachable } from './utils';
import { getSerializerByKey } from './utils/getSerializerByKey';
import { wrapWithBlockId } from './wrapWithBlockId';

export const convertNodesSerialize = (
  nodes: Descendant[],
  options: SerializeMdOptions,
  isBlock = false
): MdRootContent[] => {
  const mdastNodes: MdRootContent[] = [];
  let textQueue: Text[] = [];

  const listBlock: TListElement[] = [];

  for (let i = 0; i <= nodes.length; i++) {
    const node = nodes[i];

    if (node && TextApi.isText(node)) {
      // Only add text nodes that pass the filtering
      if (shouldIncludeText(node, options)) {
        textQueue.push(node);
      }
    } else {
      if (textQueue.length > 0) {
        mdastNodes.push(...convertTextsSerialize(textQueue, options));
      }
      textQueue = [];
      if (!node) continue;

      // Skip this node if it doesn't pass the filtering
      if (!shouldIncludeNode(node, options)) {
        continue;
      }

      const pType = getPluginType(options.editor!, KEYS.p) ?? KEYS.p;

      if (isListElement(node, pType)) {
        listBlock.push(node);

        const next = nodes[i + 1];
        const isNextIndent = isListElement(next, pType);
        const firstList = listBlock.at(0);
        const hasDifferentListStyle =
          isNextIndent &&
          firstList &&
          next.listStyleType !== firstList.listStyleType &&
          next.indent === firstList.indent;

        if (!isNextIndent || hasDifferentListStyle) {
          // Pass the original nodes and isBlock flag to listToMdastTree
          // so it can handle wrapping individual items with block IDs
          const result = listToMdastTree(listBlock, options, isBlock);

          // Handle fragment type (used when list items have IDs)
          if (result.type === 'fragment') {
            mdastNodes.push(...result.children);
          } else {
            mdastNodes.push(result);
          }

          listBlock.length = 0;
        }
      } else {
        const mdastNode = buildMdastNode(node, options, isBlock);

        if (mdastNode) {
          mdastNodes.push(mdastNode);
        }
      }
    }
  }

  return mdastNodes;
};

export const buildMdastNode = (
  node: Element,
  options: SerializeMdOptions,
  isBlock = false
) => {
  const editor = options.editor!;

  let key = getPluginKey(editor, node.type) ?? node.type;

  if (KEYS.heading.includes(key)) {
    key = 'heading';
  }

  if (key === KEYS.olClassic || key === KEYS.ulClassic) {
    key = 'list';
  }

  const nodeParser = getSerializerByKey(key, options);

  if (nodeParser) {
    const mdastNode = nodeParser(node, options);

    // If withBlockId is enabled and the node has an ID, wrap it
    // But only wrap if isBlock is true (top-level elements only)
    if (options.withBlockId && typeof node.id === 'string' && isBlock) {
      return wrapWithBlockId(mdastNode, node.id);
    }

    return mdastNode;
  }

  unreachable(node);
};

const isListElement = (
  node: Descendant | undefined,
  paragraphType: string
): node is TListElement =>
  !!node &&
  !TextApi.isText(node) &&
  node.type === paragraphType &&
  typeof node.listStyleType === 'string' &&
  typeof node.indent === 'number';

const shouldIncludeText = (
  text: Text,
  options: SerializeMdOptions
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;

  // First check allowedNodes/disallowedNodes
  if (
    allowedNodes &&
    disallowedNodes &&
    allowedNodes.length > 0 &&
    disallowedNodes.length > 0
  ) {
    throw new Error('Cannot combine allowedNodes with disallowedNodes');
  }

  // Check text properties against allowedNodes/disallowedNodes
  for (const [key, value] of Object.entries(text)) {
    if (key === 'text') continue;

    if (allowedNodes) {
      // If allowedNodes is specified, only include if the mark is in allowedNodes
      if (!allowedNodes.includes(key) && value) {
        return false;
      }
    } else if (disallowedNodes?.includes(key) && value) {
      // If using disallowedNodes, exclude if the mark is in disallowedNodes
      return false;
    }
  }

  // Finally, check allowNode if provided
  if (allowNode?.serialize) {
    return allowNode.serialize(text);
  }

  return true;
};

const shouldIncludeNode = (
  node: Element,
  options: SerializeMdOptions
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;

  if (!node.type) return true;

  // First check allowedNodes/disallowedNodes
  if (
    allowedNodes &&
    disallowedNodes &&
    allowedNodes.length > 0 &&
    disallowedNodes.length > 0
  ) {
    throw new Error('Cannot combine allowedNodes with disallowedNodes');
  }

  if (allowedNodes) {
    // If allowedNodes is specified, only include if the type is in allowedNodes
    if (!allowedNodes.includes(node.type)) {
      return false;
    }
  } else if (disallowedNodes?.includes(node.type)) {
    // If using disallowedNodes, exclude if the type is in disallowedNodes
    return false;
  }

  // Finally, check allowNode if provided
  if (allowNode?.serialize) {
    return allowNode.serialize(node);
  }

  return true;
};
