import type { Descendant } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';

import { serializeUnknownMdxNode } from '../internal/markdownDocument';
import { runMarkdownDecodeCodecs } from '../internal/markdownCodecs';
import { mdastToPlate } from '../types';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdContext
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node) => {
    // Only process nodes that pass the filtering
    if (shouldIncludeNode(node, options)) {
      acc.push(...buildSlateNode(node, deco, options));
    }
    return acc;
  }, []);
};

export const buildSlateNode = (
  mdastNode: MdRootContent | UnistNode,
  deco: MdDecoration,
  options: DeserializeMdContext
): Descendant[] => {
  const runParser = (
    parser:
      | NonNullable<DeserializeMdContext['rules']>[string]
      | null
      | undefined
  ) => {
    const result = parser?.deserialize?.(mdastNode, deco, options);

    if (result === undefined) return;

    return Array.isArray(result) ? result : [result];
  };

  /** Handle custom mdx nodes */
  if (isMdxJsxNode(mdastNode)) {
    const pluginName = mdastNode.name
      ? (options.registry.getName(mdastNode.name) ?? mdastNode.name)
      : null;

    if (pluginName) {
      const type = options.registry.getType(mdastToPlate(pluginName));
      const parserName = options.registry.getName(type) ?? type;
      const overridden = runParser(options.ruleOverrides?.[parserName]);

      if (overridden) return overridden;

      const compiled = options.compiledCodecs
        ? runMarkdownDecodeCodecs(
            options.compiledCodecs,
            pluginName,
            mdastNode,
            deco,
            options
          )
        : undefined;

      if (compiled !== undefined) {
        return Array.isArray(compiled) ? compiled : [compiled];
      }

      const fallback = runParser(options.rules?.[parserName]);

      if (fallback) return fallback;
    } else {
      console.warn(
        'This MDX node does not have a parser for deserialization',
        mdastNode
      );
    }

    if (mdastNode.type === 'mdxJsxTextElement') {
      return [{ text: serializeUnknownMdxNode(mdastNode) }];
    }

    return [
      {
        children: [{ text: serializeUnknownMdxNode(mdastNode) }],
        type: options.registry.getType(KEYS.p),
      },
    ];
  }

  const type = options.registry.getType(mdastToPlate(mdastNode.type));

  const pluginName = options.registry.getName(type) ?? type;
  const overridden = runParser(options.ruleOverrides?.[pluginName]);

  if (overridden) return overridden;

  const compiled = options.compiledCodecs
    ? runMarkdownDecodeCodecs(
        options.compiledCodecs,
        mdastNode.type,
        mdastNode,
        deco,
        options
      )
    : undefined;

  if (compiled !== undefined) {
    return Array.isArray(compiled) ? compiled : [compiled];
  }

  const fallback = runParser(options.rules?.[pluginName]);

  if (fallback) return fallback;
  return [];
};

const isMdxJsxNode = (
  node: MdRootContent | UnistNode
): node is MdxJsxFlowElement | MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement';

const shouldIncludeNode = (
  node: MdRootContent,
  options: DeserializeMdContext
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;

  if (!node.type) return true;

  const type = options.registry.getType(mdastToPlate(node.type));

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
    if (!allowedNodes.includes(type)) {
      return false;
    }
  } else if (disallowedNodes?.includes(type)) {
    // If using disallowedNodes, exclude if the type is in disallowedNodes
    return false;
  }

  // Finally, check allowNode if provided
  if (allowNode?.deserialize) {
    return allowNode.deserialize({
      ...node,
      type,
    });
  }

  return true;
};
