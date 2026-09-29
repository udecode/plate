import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { Descendant } from '../../../core';
import { PLUGINS } from '../../../core';
import { serializeUnknownMdxNode } from '../internal/markdownDocument';
import {
  getMarkdownDecoders,
  runMarkdownDecoders,
} from '../internal/markdownMappings';
import { getMarkdownTagRepair } from '../internal/markdownTags';
import type { MdRootContent } from '../mdast';
import type { DeserializeMdContext, MdMarks } from '../types';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  marks: MdMarks,
  options: DeserializeMdContext,
  previousSibling: MdRootContent | null = null
): Descendant[] =>
  nodes.flatMap((node, index) =>
    buildSlateNode(
      node,
      marks,
      options,
      index === 0 ? previousSibling : nodes[index - 1]
    )
  );

export const buildSlateNode = (
  mdastNode: MdRootContent | UnistNode,
  marks: MdMarks,
  options: DeserializeMdContext,
  previousSibling: MdRootContent | null = null
): Descendant[] => {
  if (isMdxJsxNode(mdastNode)) {
    const tag = mdastNode.name ?? '';
    const repair = getMarkdownTagRepair(mdastNode);

    if (repair && !(options.partial && repair.atEnd)) {
      options.report({
        code: 'markdown-tag-repair',
        message: `Markdown tag <${tag}> is ${repair.repair} and was closed at the end of its container.`,
        reason: repair.repair,
        severity: 'warning',
        source: options.sourceLocation(mdastNode),
        tag,
      });
    }
    // Persisted block identity: compatible reads only.
    if (mdastNode.type === 'mdxJsxFlowElement' && tag === 'block') {
      return readBlockIdentity(mdastNode, marks, options);
    }
  }

  const decoders = getMarkdownDecoders(options.mappings, mdastNode);
  const decoded = decoders
    ? runMarkdownDecoders(decoders, mdastNode, marks, options, previousSibling)
    : undefined;

  if (decoded !== undefined) return decoded;
  if (!isMdxJsxNode(mdastNode)) {
    options.report({
      action: 'dropped',
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      message: `Markdown node "${mdastNode.type}" has no installed mapping.`,
      nodeType: mdastNode.type,
      owner: 'markdown',
      phase: 'parse',
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
      source: options.sourceLocation(mdastNode),
    });

    return [];
  }

  const nodeType = mdastNode.name || mdastNode.type;

  options.report({
    action: 'replaced',
    code: 'markdown-unsupported-node',
    impact: 'lossy',
    message: decoders
      ? `Markdown tag <${nodeType}> was not accepted by an installed mapping and was preserved as source text.`
      : `Markdown node "${nodeType}" has no installed mapping and was preserved as source text.`,
    nodeType,
    owner: 'markdown',
    phase: 'parse',
    severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
    source: options.sourceLocation(mdastNode),
  });

  const text = { text: serializeUnknownMdxNode(mdastNode) };

  return mdastNode.type === 'mdxJsxTextElement'
    ? [text]
    : [
        {
          children: [text],
          type: options.registry.type(PLUGINS.paragraph) ?? 'paragraph',
        },
      ];
};

const readBlockIdentity = (
  node: MdxJsxFlowElement,
  marks: MdMarks,
  options: DeserializeMdContext
): Descendant[] => {
  const id = node.attributes.find(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'id'
  )?.value;
  const children = convertNodesDeserialize(node.children, marks, options);
  const [block] = children;

  if (
    options.elementIds &&
    typeof id === 'string' &&
    id.length > 0 &&
    children.length === 1 &&
    block &&
    'children' in block
  ) {
    return [{ ...block, id }];
  }
  options.report({
    action: 'unwrapped',
    code: 'markdown-unsupported-node',
    // Only the block's persisted identity is dropped, not its content.
    impact: 'lossless',
    message: options.elementIds
      ? 'Markdown block identity must wrap one block with a non-empty id; the id was omitted.'
      : 'Markdown block identity requires ElementIdPlugin; the id was omitted.',
    nodeType: 'block',
    owner: 'markdown',
    phase: 'parse',
    severity: 'warning',
    source: options.sourceLocation(node),
  });

  return children;
};

const isMdxJsxNode = (
  node: MdRootContent | UnistNode
): node is MdxJsxFlowElement | MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement';
