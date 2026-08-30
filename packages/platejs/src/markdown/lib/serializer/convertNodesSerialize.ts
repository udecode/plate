import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
  PLUGINS,
} from '../../../core';
import type { ListElement } from '../../../features/list';
import type { MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';
import { convertTextsSerialize } from './convertTextsSerialize';
import { getSerializableListStyle, listToMdastTree } from './listToMdastTree';
import { wrapWithBlockId } from './wrapWithBlockId';

export const convertNodesSerialize = (
  nodes: readonly Descendant[],
  options: SerializeMdContext,
  isBlock = false
): MdRootContent[] => {
  const mdastNodes: MdRootContent[] = [];
  let textQueue: Text[] = [];

  const listBlock: ListElement[] = [];

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

      const paragraphType =
        options.registry.type(PLUGINS.paragraph) ?? 'paragraph';

      if (isListElement(node, paragraphType)) {
        listBlock.push(node);

        const next = nodes[i + 1];
        const isNextIndent = isListElement(next, paragraphType);
        const firstList = listBlock.at(0);
        const hasDifferentListStyle =
          isNextIndent &&
          firstList &&
          (next.listType !== firstList.listType ||
            getSerializableListStyle(next) !==
              getSerializableListStyle(firstList)) &&
          (next.indent ?? 1) === (firstList.indent ?? 1);
        const hasExplicitRestart =
          isNextIndent &&
          firstList &&
          next.listType === 'numbered' &&
          typeof next.listRestart === 'number' &&
          (next.indent ?? 1) === (firstList.indent ?? 1);

        if (!isNextIndent || hasDifferentListStyle || hasExplicitRestart) {
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
  options: SerializeMdContext,
  isBlock = false
) => {
  const { type } = node;
  let fallbackType = type;

  if (options.registry.type(PLUGINS.heading) === type) {
    fallbackType = 'heading';
  }

  const nodeParser =
    options.rules?.[type]?.serialize ??
    options.rules?.[fallbackType]?.serialize;

  if (nodeParser) {
    const mdastNode = nodeParser(node, options);

    if (options.withBlockId && isBlock) {
      const blockId = options.blockId?.(node);

      if (typeof blockId !== 'string' || blockId.length === 0) {
        throw new Error('Element ID must be a non-empty string.');
      }

      return wrapWithBlockId(mdastNode, blockId);
    }

    return mdastNode;
  }

  console.warn(`Unreachable code: ${JSON.stringify(node)}`);

  return undefined;
};

const isListElement = (
  node: Descendant | undefined,
  paragraphType: string
): node is ListElement =>
  !!node &&
  !TextApi.isText(node) &&
  node.type === paragraphType &&
  typeof node.listType === 'string';

const shouldIncludeText = (
  text: Text,
  options: SerializeMdContext
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;
  const allowedNodeSet = allowedNodes ? new Set(allowedNodes) : null;
  const disallowedNodeSet = disallowedNodes ? new Set(disallowedNodes) : null;

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

    if (allowedNodeSet) {
      // If allowedNodes is specified, only include if the mark is in allowedNodes
      if (!allowedNodeSet.has(key) && value) {
        return false;
      }
    } else if (disallowedNodeSet?.has(key) && value) {
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
  options: SerializeMdContext
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
