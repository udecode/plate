import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
  PLUGINS,
} from '../../../core';
import type { ListElement } from '../../../features/list';
import { encodeMarkdownParagraph } from '../internal/markdownIntrinsics';
import type { MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';
import { convertTextsSerialize } from './convertTextsSerialize';
import { getSerializableListStyle, listToMdastTree } from './listToMdastTree';
import { reportOmittedProperties } from './reportOmittedProperties';

// The flat-list properties the list serializer writes.
const LIST_PROPERTIES: ReadonlySet<string> = new Set([
  'checked',
  'indent',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
]);

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

      const paragraphType =
        options.registry.type(PLUGINS.paragraph) ?? 'paragraph';

      if (isListElement(node, paragraphType)) {
        reportOmittedProperties(node, LIST_PROPERTIES, options, 'list');
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

export const buildMdastNode = (
  node: Element,
  options: SerializeMdContext
): MdRootContent | undefined => {
  const encode =
    options.mappings.encodeByType.get(node.type) ??
    (node.type === (options.registry.type(PLUGINS.paragraph) ?? 'paragraph')
      ? encodeMarkdownParagraph
      : undefined);

  if (encode) return encode(node, options);

  options.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    message: `Plate node "${node.type}" has no installed Markdown mapping.`,
    model: options.modelLocation(node),
    nodeType: node.type,
    owner: 'markdown',
    phase: 'serialize',
    severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
  });

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
