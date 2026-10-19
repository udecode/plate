import isEqual from 'lodash/isEqual.js';

import {
  type Descendant,
  type Editor,
  type EditorCoreStateView,
  type Element,
  ElementApi,
  NodeApi,
  PathApi,
  type Range,
  RangeApi,
  TextApi,
} from '../../core';
import { canPlaceBlocksAtPath } from '../../facade';
import {
  type ListLanding,
  type NodeReader,
  landListContent,
} from '../../features/list/lib/listIdentity.internal';
import {
  getHeadingType,
  isListItem,
} from '../../features/list/lib/listIndex.internal';

const hasListItems = (nodes: readonly Descendant[]): boolean =>
  nodes.some(
    (node) =>
      ElementApi.isElement(node) &&
      (isListItem(node) || hasListItems(node.children))
  );

/**
 * The range the AI works on for a text selection. A range that ends at the
 * start of a block, or starts at the end of one, leaves that block out, and a
 * range that still crosses blocks covers the whole lowest blocks it touches,
 * which are the blocks the edit prompt serializes.
 */
export const captureTextRange = <R extends Range>(
  state: Pick<EditorCoreStateView, 'nodes' | 'points'>,
  range: R
): R => {
  if (RangeApi.isCollapsed(range)) return range;

  let [start, end] = RangeApi.edges(range);
  let startBlock = state.nodes.block({ at: start });
  let endBlock = state.nodes.block({ at: end });

  if (!startBlock || !endBlock) return range;
  if (
    !PathApi.equals(startBlock[1], endBlock[1]) &&
    state.points.isStart(end, endBlock[1])
  ) {
    end = state.points.before(end) ?? end;
    endBlock = state.nodes.block({ at: end }) ?? endBlock;
  }
  if (
    !PathApi.equals(startBlock[1], endBlock[1]) &&
    state.points.isEnd(start, startBlock[1])
  ) {
    start = state.points.after(start) ?? start;
    startBlock = state.nodes.block({ at: start }) ?? startBlock;
  }
  if (!PathApi.equals(startBlock[1], endBlock[1])) {
    start = state.points.start(startBlock[1]) ?? start;
    end = state.points.end(endBlock[1]) ?? end;
  }

  return RangeApi.isBackward(range)
    ? { ...range, anchor: end, focus: start }
    : { ...range, anchor: start, focus: end };
};

/**
 * The sibling blocks `range` covers whole, with the nodes `land` builds from
 * the first of them, or `undefined` when the range is not whole sibling blocks
 * or the schema would not let those nodes replace them, such as a replacement
 * that removes a required title.
 */
export const wholeTextBlocks = (
  state: Pick<EditorCoreStateView, 'nodes' | 'points' | 'schema' | 'view'>,
  range: Range,
  land: (first: Element) => Element[]
) => {
  const [start, end] = RangeApi.edges(range);
  const blocks = state.nodes.blocks({ at: range });
  const first = blocks[0];
  const last = blocks.at(-1);

  if (
    !first ||
    !last ||
    !state.points.isStart(start, first[1]) ||
    !state.points.isEnd(end, last[1])
  ) {
    return undefined;
  }

  const parentPath = PathApi.parent(first[1]);

  if (
    !blocks.every(([, path]) =>
      PathApi.equals(PathApi.parent(path), parentPath)
    )
  ) {
    return undefined;
  }

  const nodes = land(first[0]);

  return canPlaceBlocksAtPath(state.schema, first[1], nodes, {
    removing: blocks.map(([, path]) => path.at(-1) ?? 0),
    root: state.view.root(),
  })
    ? { blocks, nodes }
    : undefined;
};

/**
 * Copy the source block's formatting onto AI output. An answer that writes
 * lists keeps them, so only an answer without list items takes the source's
 * block properties, and never its list id or numbering, which the landing
 * decides. A copied indent becomes the first level, and the landing sets the
 * depth.
 */
export const formatAIOutput = ({
  blocks,
  format,
  sourceBlock,
}: {
  blocks: Element[];
  format: 'all' | 'none' | 'single';
  sourceBlock: Element;
}) => {
  if (format === 'none') return blocks;

  const firstText = NodeApi.first(sourceBlock, [0]);

  if (!TextApi.isText(firstText[0])) return null;

  const {
    children: _children,
    indent,
    listId: _listId,
    listLevels: _listLevels,
    listRestart: _listRestart,
    listStart: _listStart,
    ...blockProps
  } = sourceBlock;
  const textProps = NodeApi.extractProps(firstText[0]);
  const ownProps = hasListItems(blocks)
    ? {}
    : { ...blockProps, ...(indent === undefined ? {} : { indent: 1 }) };
  const applyTextFormatting = (node: Descendant): Descendant =>
    TextApi.isText(node)
      ? { ...textProps, ...node }
      : ElementApi.isElement(node)
        ? {
            ...node,
            children: node.children.map(applyTextFormatting),
          }
        : node;

  return blocks.map((block, index) =>
    format === 'single' && index > 0
      ? block
      : {
          ...block,
          ...ownProps,
          children: block.children.map(applyTextFormatting),
        }
  );
};

export const landAIOutput = (
  editor: Editor,
  state: NodeReader,
  blocks: readonly Element[],
  landing: ListLanding
) => [
  ...landListContent(state, blocks, landing, {
    headingType: getHeadingType(editor),
    placement: 'land',
  }),
];

/**
 * A plain answer that replaces an empty list item takes the item's list facts,
 * so the landing keeps it in the item's list.
 */
export const fillEmptyListItem = (
  blocks: readonly Element[],
  item: Element
): Element[] => {
  const [first, ...rest] = blocks;

  if (!first || hasListItems(blocks)) return [...blocks];

  const { checked, listStyle, listType } = item;

  return [
    {
      ...first,
      ...(checked === undefined ? {} : { checked }),
      ...(listStyle === undefined ? {} : { listStyle }),
      listType,
    },
    ...rest,
  ];
};

const ALIGN_CELL_LIMIT = 1_000_000;

type SequenceChunk = {
  items: string[];
  kind: 'delete' | 'equal' | 'insert';
};

const diffSequences = (before: readonly string[], after: readonly string[]) => {
  const chunks: SequenceChunk[] = [];
  const append = (kind: SequenceChunk['kind'], item: string) => {
    const previous = chunks.at(-1);

    if (previous?.kind === kind) previous.items.push(item);
    else chunks.push({ items: [item], kind });
  };
  const isSubsequence = (
    source: readonly string[],
    target: readonly string[]
  ) => {
    let sourceIndex = 0;

    for (const item of target) {
      if (source[sourceIndex] === item) sourceIndex += 1;
    }

    return sourceIndex === source.length;
  };

  if (isSubsequence(before, after)) {
    let beforeIndex = 0;

    for (const item of after) {
      if (before[beforeIndex] === item) {
        append('equal', item);
        beforeIndex += 1;
      } else {
        append('insert', item);
      }
    }

    return chunks;
  }
  if (isSubsequence(after, before)) {
    let afterIndex = 0;

    for (const item of before) {
      if (after[afterIndex] === item) {
        append('equal', item);
        afterIndex += 1;
      } else {
        append('delete', item);
      }
    }

    return chunks;
  }
  if ((before.length + 1) * (after.length + 1) <= ALIGN_CELL_LIMIT) {
    const lengths = Array.from(
      { length: before.length + 1 },
      () => new Uint32Array(after.length + 1)
    );

    for (let left = before.length - 1; left >= 0; left -= 1) {
      for (let right = after.length - 1; right >= 0; right -= 1) {
        lengths[left][right] =
          before[left] === after[right]
            ? lengths[left + 1][right + 1] + 1
            : Math.max(lengths[left + 1][right], lengths[left][right + 1]);
      }
    }

    let left = 0;
    let right = 0;

    while (left < before.length && right < after.length) {
      if (before[left] === after[right]) {
        append('equal', before[left]);
        left += 1;
        right += 1;
      } else if (lengths[left + 1][right] >= lengths[left][right + 1]) {
        append('delete', before[left]);
        left += 1;
      } else {
        append('insert', after[right]);
        right += 1;
      }
    }
    for (; left < before.length; left += 1) append('delete', before[left]);
    for (; right < after.length; right += 1) append('insert', after[right]);

    return chunks;
  }

  let prefix = 0;

  while (
    prefix < before.length &&
    prefix < after.length &&
    before[prefix] === after[prefix]
  ) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before.at(-suffix - 1) === after.at(-suffix - 1)
  ) {
    suffix += 1;
  }

  for (const item of before.slice(0, prefix)) append('equal', item);
  for (const item of before.slice(prefix, before.length - suffix)) {
    append('delete', item);
  }
  for (const item of after.slice(prefix, after.length - suffix)) {
    append('insert', item);
  }
  for (const item of before.slice(before.length - suffix)) {
    append('equal', item);
  }

  return chunks;
};

// Words, whitespace runs and single other characters, so a rewrite proposes
// whole-word replacements instead of letters interleaved from two words.
const textTokens = (text: string) =>
  text.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];

/**
 * The edits that turn one text into another, each a replacement of
 * `before.slice(from, to)` by `text`, with offsets in `before`.
 */
export const textEdits = (before: string, after: string) => {
  const chunks = diffSequences(textTokens(before), textTokens(after));
  const edits: Array<{ from: number; text: string; to: number }> = [];
  let offset = 0;
  let index = 0;

  while (index < chunks.length) {
    if (chunks[index].kind === 'equal') {
      offset += chunks[index].items.join('').length;
      index += 1;
      continue;
    }

    const from = offset;
    let text = '';

    for (
      ;
      index < chunks.length && chunks[index].kind !== 'equal';
      index += 1
    ) {
      const changed = chunks[index].items.join('');

      if (chunks[index].kind === 'delete') offset += changed.length;
      else text += changed;
    }
    const previous = edits.at(-1);
    const gap = previous ? before.slice(previous.to, from) : '';

    // Two edits only whitespace apart read as one rewrite.
    if (previous && /^\s+$/.test(gap)) {
      previous.text += gap + text;
      previous.to = offset;
    } else {
      edits.push({ from, text, to: offset });
    }
  }

  return edits;
};

export const withoutText = (node: Descendant): Descendant =>
  TextApi.isText(node)
    ? { ...node, text: '' }
    : { ...node, children: node.children.map(withoutText) };

/**
 * Each list item's list as the order its list first appears in, since every
 * parse generates its own list ids, so two parses compare by which items share
 * a list.
 */
const listGroups = (blocks: readonly Element[]) => {
  const groups = new Map<unknown, number>();

  return blocks.map((block) => {
    if (!isListItem(block)) return undefined;
    if (!groups.has(block.listId)) groups.set(block.listId, groups.size);

    return groups.get(block.listId);
  });
};

/**
 * Whether an answer has the blocks of the source's Markdown round trip, in
 * order, with the same properties apart from text and list ids, and with list
 * items sharing a list exactly where the round trip's do. When the source is
 * one block, an answer block without a list marker matches a list item of its
 * type, because the node-selection prompt shows a single block as a plain
 * paragraph.
 */
const keepsShape = (
  answer: readonly Element[],
  roundTrip: readonly Element[]
) => {
  const answerGroups = listGroups(answer);
  const roundTripGroups = listGroups(roundTrip);

  return (
    answer.length === roundTrip.length &&
    answer.every((block, index) => {
      const source = roundTrip[index];

      if (roundTrip.length === 1 && !isListItem(block) && isListItem(source)) {
        return (
          block.type === source.type &&
          isEqual(
            block.children.map(withoutText),
            source.children.map(withoutText)
          )
        );
      }

      return isEqual(
        { ...withoutText(block), listId: answerGroups[index] },
        { ...withoutText(source), listId: roundTripGroups[index] }
      );
    })
  );
};

/**
 * The blocks a suggestion over whole source blocks writes. An answer that
 * keeps the shape of the source's Markdown round trip takes the source blocks'
 * properties, so the draft edits their text in place.
 */
export const suggestionBlocks = (
  editor: Editor,
  state: NodeReader,
  {
    answer,
    roundTrip,
    source,
  }: {
    answer: readonly Element[];
    roundTrip: readonly Element[] | null;
    source: readonly Element[];
  }
): Element[] => {
  if (
    roundTrip &&
    answer.length === source.length &&
    keepsShape(answer, roundTrip)
  ) {
    return answer.map((block, index) => ({
      ...NodeApi.extractProps(source[index]),
      children: block.children,
      type: source[index].type,
    }));
  }

  return landAIOutput(editor, state, answer, {
    block: source[0],
    kind: 'replaced',
  });
};
