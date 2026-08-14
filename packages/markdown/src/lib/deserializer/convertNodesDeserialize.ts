import type { Descendant } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';

import {
  MarkdownBlockIdError,
  serializeUnknownMdxNode,
} from '../internal/markdownDocument';
import { runMarkdownDecodeCodecs } from '../internal/markdownCodecs';
import { mdastToRule } from '../types';

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
    const source = mdastNode.name;
    const type = source ? mdastToRule(source) : null;

    if (
      mdastNode.type === 'mdxJsxFlowElement' &&
      source === 'block' &&
      !options.elementIds
    ) {
      throw new MarkdownBlockIdError(
        'Markdown block identity requires ElementIdPlugin in the editor.'
      );
    }
    if (
      mdastNode.type === 'mdxJsxFlowElement' &&
      source === 'block' &&
      options.elementIds
    ) {
      const id = mdastNode.attributes.find(
        (attribute) =>
          attribute.type === 'mdxJsxAttribute' && attribute.name === 'id'
      )?.value;

      if (typeof id !== 'string' || id.length === 0) {
        throw new MarkdownBlockIdError(
          'Markdown block identity requires a non-empty id.'
        );
      }
      const children = convertNodesDeserialize(
        mdastNode.children,
        deco,
        options
      );

      if (children.length !== 1 || !('children' in children[0]!)) {
        throw new MarkdownBlockIdError(
          'Markdown block identity must wrap exactly one block element.'
        );
      }

      return [
        {
          ...children[0],
          id,
        },
      ];
    }

    if (type) {
      const hasCompiledSource =
        options.compiledCodecs?.decodeBySource.has(source!) ?? false;
      const compiled = options.compiledCodecs
        ? runMarkdownDecodeCodecs(
            options.compiledCodecs,
            source!,
            mdastNode,
            deco,
            options,
            (pluginName) => runParser(options.ruleOverrides?.[pluginName])
          )
        : undefined;

      if (compiled !== undefined) {
        return Array.isArray(compiled) ? compiled : [compiled];
      }

      if (!hasCompiledSource) {
        const overridden = runParser(options.ruleOverrides?.[type]);

        if (overridden) return overridden;

        const fallback = runParser(options.rules?.[type]);

        if (fallback) return fallback;
      }
    } else {
      console.warn(
        'This MDX node does not have a parser for deserialization',
        mdastNode
      );
    }

    if (mdastNode.type === 'mdxJsxTextElement') {
      return [{ text: serializeUnknownMdxNode(mdastNode) }];
    }

    const paragraphType =
      options.registry.type(PLUGINS.paragraph) ?? 'paragraph';

    return [
      {
        children: [{ text: serializeUnknownMdxNode(mdastNode) }],
        type: paragraphType,
      },
    ];
  }

  const type = mdastToRule(mdastNode.type);
  const hasCompiledSource =
    options.compiledCodecs?.decodeBySource.has(mdastNode.type) ?? false;
  const compiled = options.compiledCodecs
    ? runMarkdownDecodeCodecs(
        options.compiledCodecs,
        mdastNode.type,
        mdastNode,
        deco,
        options,
        (pluginName) => runParser(options.ruleOverrides?.[pluginName])
      )
    : undefined;

  if (compiled !== undefined) {
    return Array.isArray(compiled) ? compiled : [compiled];
  }

  if (!hasCompiledSource) {
    const overridden = runParser(options.ruleOverrides?.[type]);

    if (overridden) return overridden;

    const fallback = runParser(options.rules?.[type]);

    if (fallback) return fallback;
  }
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

  const type = mdastToRule(node.type);

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
