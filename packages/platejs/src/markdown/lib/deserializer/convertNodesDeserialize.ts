import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { Descendant } from '../../../core';
import { PLUGINS } from '../../../core';
import { failInvariant } from '../../internal/failInvariant';
import {
  MarkdownBlockIdError,
  serializeUnknownMdxNode,
} from '../internal/markdownDocument';
import { runMarkdownDecodeMappings } from '../internal/markdownMappings';
import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';
import { mdastToRule } from '../types';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdContext
): Descendant[] =>
  nodes.reduce<Descendant[]>((acc, node) => {
    if (shouldIncludeNode(node, options)) {
      acc.push(...buildSlateNode(node, deco, options));
    } else {
      const nodeType = mdastToRule(node.type);

      options.report({
        code: 'markdown-filtered-node',
        message: `Markdown node "${nodeType}" was omitted by the active filter.`,
        nodeType,
        severity: 'warning',
        source: options.sourceLocation(node),
      });
    }
    return acc;
  }, []);

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

    if (result === undefined) return undefined;

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

      if (children.length !== 1 || !('children' in children[0])) {
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
        options.compiledMappings?.decodeBySource.has(
          source ?? failInvariant('Expected value to be defined')
        ) ?? false;
      const compiled = options.compiledMappings
        ? runMarkdownDecodeMappings(
            options.compiledMappings,
            source ?? failInvariant('Expected value to be defined'),
            mdastNode,
            deco,
            options
          )
        : undefined;

      if (compiled !== undefined) {
        return Array.isArray(compiled) ? compiled : [compiled];
      }

      if (!hasCompiledSource) {
        const fallback = runParser(options.rules?.[type]);

        if (fallback) return fallback;
      }
    }

    const nodeType = source || mdastNode.type;

    options.report({
      action: 'replaced',
      code: 'markdown-unsupported-node',
      message: `Markdown node "${nodeType}" has no installed mapping and was preserved as source text.`,
      nodeType,
      owner: 'markdown',
      phase: 'parse',
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
      source: options.sourceLocation(mdastNode),
    });

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
    options.compiledMappings?.decodeBySource.has(mdastNode.type) ?? false;
  const compiled = options.compiledMappings
    ? runMarkdownDecodeMappings(
        options.compiledMappings,
        mdastNode.type,
        mdastNode,
        deco,
        options
      )
    : undefined;

  if (compiled !== undefined) {
    return Array.isArray(compiled) ? compiled : [compiled];
  }

  if (!hasCompiledSource) {
    const fallback = runParser(options.rules?.[type]);

    if (fallback) return fallback;
  }
  options.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    message: `Markdown node "${mdastNode.type}" has no installed mapping.`,
    nodeType: mdastNode.type,
    owner: 'markdown',
    phase: 'parse',
    severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
    source: options.sourceLocation(mdastNode),
  });

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

  if (
    allowedNodes &&
    disallowedNodes &&
    allowedNodes.length > 0 &&
    disallowedNodes.length > 0
  ) {
    throw new Error('Cannot combine allowedNodes with disallowedNodes');
  }

  if (allowedNodes) {
    if (!allowedNodes.includes(type)) {
      return false;
    }
  } else if (disallowedNodes?.includes(type)) {
    return false;
  }

  if (allowNode?.deserialize) {
    return allowNode.deserialize({
      ...node,
      type,
    });
  }

  return true;
};
