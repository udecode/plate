import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
  PLUGINS,
} from '../../../core';
import type { ListElement } from '../../../features/list';
import { listItemDepth } from '../../../features/list/lib/listIndex.internal';
import {
  getMarkdownParagraphType,
  landsMarkdownParagraph,
} from '../../../internal/plugin/markdownParagraph';
import {
  encodeMarkdownParagraph,
  getMarkdownParagraphLanding,
} from '../internal/markdownIntrinsics';
import type { MarkdownEncoded } from '../internal/markdownMappings';
import type { MdList, MdRootContent } from '../mdast';
import type { SerializeMdContext } from '../types';
import { convertTextsSerialize } from './convertTextsSerialize';
import {
  continueMarkdownList,
  isSameMarkdownList,
  listToMdastTree,
} from './listToMdastTree';
import { reportOmittedProperties } from './reportOmittedProperties';

const NO_CLAIMS: ReadonlySet<string> = new Set();

export const convertNodesSerialize = (
  nodes: readonly Descendant[],
  options: SerializeMdContext
): MdRootContent[] => {
  const mdastNodes: MdRootContent[] = [];
  let textQueue: Text[] = [];

  const listBlock: Element[] = [];
  let restartedFrom: MdList | undefined;

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

      if (isListElement(node, options) || isListContinuation(listBlock, node)) {
        listBlock.push(node);

        const next = nodes[i + 1];
        const isNextIndent =
          isListElement(next, options) || isListContinuation(listBlock, next);
        const firstList = listBlock.find((block) =>
          isListElement(block, options)
        );
        const isSameIndent =
          isListElement(next, options) &&
          firstList &&
          (next.indent ?? 1) === (firstList.indent ?? 1);
        const isOtherList =
          isSameIndent && !isSameMarkdownList(next, firstList);
        const hasExplicitRestart =
          isSameIndent &&
          next.listType === 'numbered' &&
          typeof next.listRestart === 'number';

        if (!isNextIndent || isOtherList || hasExplicitRestart) {
          const list = listToMdastTree(listBlock, options);

          if (restartedFrom) continueMarkdownList(options, list, restartedFrom);
          restartedFrom = hasExplicitRestart && !isOtherList ? list : undefined;
          mdastNodes.push(list);

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

const isLandedParagraph = (node: Element, options: SerializeMdContext) => {
  if (!landsMarkdownParagraph(options.registry)) return false;

  const location = options.modelLocation(node);

  return (
    location?.root === undefined &&
    location?.path?.length === 1 &&
    node.children.every(
      (child) => TextApi.isText(child) || options.isInline(child)
    ) &&
    getMarkdownParagraphLanding(options.state.schema, location.path[0])
      ?.type === node.type
  );
};

/** Encode one element without reporting its unclaimed properties. */
export const encodeMdastNode = (
  node: Element,
  options: SerializeMdContext
): MarkdownEncoded | undefined => {
  const encode = options.mappings.encodeByType.get(node.type);

  if (encode) return encode(node, options);
  if (
    node.type === getMarkdownParagraphType(options.registry) ||
    isLandedParagraph(node, options)
  ) {
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

// Markdown list parsing gives an item's later blocks its indent + 1 and no
// listType, so such a block stays in the open item at its indent - 1.
const isListContinuation = (
  run: readonly Element[],
  node: Descendant | undefined
): node is Element => {
  if (
    !node ||
    TextApi.isText(node) ||
    node.listType !== undefined ||
    typeof node.indent !== 'number' ||
    node.indent < 2
  ) {
    return false;
  }
  const ownerIndent = node.indent - 1;
  const owner = run.findLast((block) => listItemDepth(block) <= ownerIndent);

  return (
    owner !== undefined &&
    listItemDepth(owner) === ownerIndent &&
    owner.listType !== undefined
  );
};

// List items are the block types Markdown list decoding rebuilds.
const isListElement = (
  node: Descendant | undefined,
  options: SerializeMdContext
): node is ListElement =>
  !!node &&
  !TextApi.isText(node) &&
  typeof node.listType === 'string' &&
  (node.type === getMarkdownParagraphType(options.registry) ||
    node.type === options.registry.type(PLUGINS.image));
