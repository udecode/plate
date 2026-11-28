import { type Descendant, type Element, TextApi, PLUGINS } from '../../../core';
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
import { convertPhrasingSerialize } from './convertPhrasingSerialize';
import {
  continueMarkdownList,
  isSameMarkdownList,
  listToMdastTree,
} from './listToMdastTree';
import { reportOmittedProperties } from './reportOmittedProperties';

const NO_CLAIMS: ReadonlySet<string> = new Set();

export const convertNodesSerialize = (
  nodes: readonly Descendant[],
  options: SerializeMdContext,
  { hardBreaks = false }: Readonly<{ hardBreaks?: boolean }> = {}
): MdRootContent[] => {
  const mdastNodes: MdRootContent[] = [];
  let phrasing: Descendant[] = [];

  const listBlock: Element[] = [];
  let restartedFrom: MdList | undefined;

  for (let i = 0; i <= nodes.length; i++) {
    const node = nodes[i];

    if (node && (TextApi.isText(node) || options.isInline(node))) {
      phrasing.push(node);
    } else {
      if (phrasing.length > 0) {
        mdastNodes.push(
          ...convertPhrasingSerialize(
            phrasing,
            options,
            buildMdastNodes,
            hardBreaks
          )
        );
      }
      phrasing = [];
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
        mdastNodes.push(...buildMdastNodes(node, options));
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
      nodes: [encodeMarkdownParagraph(node, options)],
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

const buildMdastNodes = (
  node: Element,
  options: SerializeMdContext
): readonly MdRootContent[] => {
  const encoded = encodeMdastNode(node, options);

  if (!encoded) return [];
  reportOmittedProperties(node, encoded.claimed, options, encoded.owner);

  return encoded.nodes;
};

// Markdown list parsing gives an item's later blocks its indent + 1 and no
// listType, so such a block stays in the open item at its indent - 1.
const mayContinueListItem = (
  node: Descendant | undefined
): node is Element & { indent: number } =>
  !!node &&
  !TextApi.isText(node) &&
  node.listType === undefined &&
  typeof node.indent === 'number' &&
  node.indent >= 2;

const isListContinuation = (
  run: readonly Element[],
  node: Descendant | undefined
): node is Element => {
  if (!mayContinueListItem(node)) return false;
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
  options: Pick<SerializeMdContext, 'registry'>
): node is ListElement =>
  !!node &&
  !TextApi.isText(node) &&
  typeof node.listType === 'string' &&
  (node.type === getMarkdownParagraphType(options.registry) ||
    node.type === options.registry.type(PLUGINS.image));
