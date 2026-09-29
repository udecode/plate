import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
  PLUGINS,
} from '../../../core';
import type { ListElement } from '../../../features/list';
import { encodeMarkdownParagraph } from '../internal/markdownIntrinsics';
import type { MarkdownEncoded } from '../internal/markdownMappings';
import type { MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';
import { convertTextsSerialize } from './convertTextsSerialize';
import { getSerializableListStyle, listToMdastTree } from './listToMdastTree';
import { reportOmittedProperties } from './reportOmittedProperties';

const NO_CLAIMS: ReadonlySet<string> = new Set();

export const convertNodesSerialize = (
  nodes: readonly Descendant[],
  options: SerializeMdContext
): MdRootContent[] => {
  const mdastNodes: MdRootContent[] = [];
  let textQueue: Text[] = [];

  const listBlock: ListElement[] = [];

  for (let i = 0; i <= nodes.length; i++) {
    const node = nodes[i];

    if (node && TextApi.isText(node)) {
      textQueue.push(node);
    } else {
      if (textQueue.length > 0) {
        mdastNodes.push(...convertTextsSerialize(textQueue, options));
      }
      textQueue = [];
      if (!node) continue;

      if (isListElement(node, options)) {
        listBlock.push(node);

        const next = nodes[i + 1];
        const isNextIndent = isListElement(next, options);
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
          mdastNodes.push(listToMdastTree(listBlock, options));

          listBlock.length = 0;
        }
      } else {
        const mdastNode = buildMdastNode(node, options);

        if (mdastNode) {
          mdastNodes.push(mdastNode);
        }
      }
    }
  }

  return mdastNodes;
};

/** Encode one element without reporting its unclaimed properties. */
export const encodeMdastNode = (
  node: Element,
  options: SerializeMdContext
): MarkdownEncoded | undefined => {
  const encode = options.mappings.encodeByType.get(node.type);

  if (encode) return encode(node, options);
  if (node.type === (options.registry.type(PLUGINS.paragraph) ?? 'paragraph')) {
    return {
      claimed: NO_CLAIMS,
      node: encodeMarkdownParagraph(node, options),
      owner: 'markdown',
    };
  }

  options.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    impact: 'lossy',
    message: `Plate node "${node.type}" has no installed Markdown mapping.`,
    model: options.modelLocation(node),
    nodeType: node.type,
    owner: 'markdown',
    phase: 'serialize',
    severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
  });

  return undefined;
};

export const buildMdastNode = (
  node: Element,
  options: SerializeMdContext
): MdRootContent | undefined => {
  const encoded = encodeMdastNode(node, options);

  if (!encoded) return undefined;
  reportOmittedProperties(node, encoded.claimed, options, encoded.owner);

  return encoded.node;
};

// List items are the block types Markdown list decoding rebuilds.
const isListElement = (
  node: Descendant | undefined,
  options: SerializeMdContext
): node is ListElement =>
  !!node &&
  !TextApi.isText(node) &&
  typeof node.listType === 'string' &&
  (node.type === (options.registry.type(PLUGINS.paragraph) ?? 'paragraph') ||
    node.type === options.registry.type(PLUGINS.image));
