import {
  type Descendant,
  type Element,
  type Text,
  TextApi,
} from '../../../core';
import { getMarkdownMarkWriter } from '../internal/markdownMappings';
import type { MdRootContent } from '../mdast';
import type { MdMark, SerializeMdContext } from '../types';

type MdContainer = Exclude<MdMark, { type: 'inlineCode' | 'text' }>;
type Mark = Readonly<{ container: MdContainer; key: string }>;
type Item = Readonly<{
  content: readonly MdRootContent[];
  marks: readonly Mark[];
}>;

const SPANNING_KINDS: ReadonlySet<string> = new Set([
  'delete',
  'emphasis',
  'strong',
]);
const LEADING_SPACES = /^ +/;
const TRAILING_SPACES = / +$/;

export const convertPhrasingSerialize = (
  nodes: readonly Descendant[],
  options: SerializeMdContext,
  encodeInline: (
    node: Element,
    options: SerializeMdContext
  ) => readonly MdRootContent[],
  hardBreaks: boolean
): MdRootContent[] => {
  const { mappings } = options;
  const plainMarkSet = new Set(options.plainMarks);
  const writerOf = (leaf: Text, key: string) =>
    plainMarkSet.has(key)
      ? undefined
      : getMarkdownMarkWriter(mappings, key, leaf[key]);
  const ownWriterOf = (leaf: Text, key: string) =>
    leaf[key] && !options.enclosedMarks?.get(leaf)?.has(key)
      ? writerOf(leaf, key)
      : undefined;

  const reportOmitted = (leaf: Text) => {
    for (const [key, value] of Object.entries(leaf)) {
      if (
        key === 'text' ||
        !value ||
        plainMarkSet.has(key) ||
        writerOf(leaf, key) !== undefined ||
        options.state.schema.property({ key, placement: 'text' })?.role ===
          'metadata'
      ) {
        continue;
      }
      options.report({
        code: 'markdown-property-omitted',
        key,
        message: `Markdown cannot represent text property "${key}"; it was omitted.`,
        model: { ...options.modelLocation(leaf), property: key },
        owner: key,
        phase: 'serialize',
        reason: 'unsupported',
        severity: 'warning',
      });
    }
  };

  const marksOf = (leaf: Text) => {
    const marks: Mark[] = [];
    let code = false;

    for (const key of mappings.markOrder) {
      const writer = ownWriterOf(leaf, key);

      if (!writer) continue;
      switch (writer.kind) {
        case 'delete':
        case 'emphasis':
        case 'strong': {
          marks.push({ container: { children: [], type: writer.kind }, key });
          break;
        }
        case 'inlineCode': {
          code = true;
          break;
        }
        case 'wrap': {
          const node = writer.wrap?.(leaf, options);

          if (node && isMdMarkContainer(node)) {
            marks.push({ container: { ...node, children: [] }, key });
          }
          break;
        }
      }
    }

    return { code, marks };
  };

  const spanningMarksOf = (leaves: readonly Text[]) => {
    const written = leaves.filter((leaf) => leaf.text);

    return written[0]
      ? marksOf(written[0]).marks.filter(
          ({ container, key }) =>
            SPANNING_KINDS.has(container.type) &&
            written.every(
              (leaf) => ownWriterOf(leaf, key)?.kind === container.type
            )
        )
      : [];
  };

  const items: Item[] = [];

  for (const node of nodes) {
    if (TextApi.isText(node)) {
      reportOmitted(node);
      const { code, marks } = marksOf(node);
      const lines = hardBreaks ? node.text.split(/\r?\n/) : [node.text];
      const breakMarks = marks.filter(({ container }) =>
        SPANNING_KINDS.has(container.type)
      );

      lines.forEach((value, index) => {
        if (index > 0) {
          items.push({ content: [{ type: 'break' }], marks: breakMarks });
        }
        if (value) {
          items.push({
            content: [{ type: code ? 'inlineCode' : 'text', value }],
            marks,
          });
        }
      });
      continue;
    }

    const leaves = textsOf(node);
    const spanning = spanningMarksOf(leaves);
    const enclosedMarks = new WeakMap<Text, ReadonlySet<string>>();

    for (const leaf of leaves) {
      enclosedMarks.set(
        leaf,
        new Set([
          ...(options.enclosedMarks?.get(leaf) ?? []),
          ...spanning.map(({ key }) => key),
        ])
      );
    }
    items.push({
      content: encodeInline(
        node,
        spanning.length > 0 ? { ...options, enclosedMarks } : options
      ),
      marks: spanning,
    });
  }

  const carries = (item: Item | undefined, mark: Mark) =>
    !!item?.marks.some(
      (other) =>
        other.key === mark.key && sameContainer(other.container, mark.container)
    );
  const runEnds = items.map(() => new Map<string, number>());

  for (let index = items.length - 1; index >= 0; index -= 1) {
    for (const mark of items[index].marks) {
      runEnds[index].set(
        mark.key,
        carries(items[index + 1], mark)
          ? (runEnds[index + 1].get(mark.key) ?? index)
          : index
      );
    }
  }

  const root: MdRootContent[] = [];
  const own: OwnContainers = new WeakSet();
  const open: Array<{ mark: Mark; node: MdContainer }> = [];
  const target = () =>
    (open.at(-1)?.node.children as MdRootContent[] | undefined) ?? root;

  items.forEach((item, index) => {
    const kept = open.findIndex((entry) => !carries(item, entry.mark));

    if (kept !== -1) open.splice(kept);
    const runEnd = (mark: Mark) => runEnds[index].get(mark.key) ?? index;
    const longestRunFirst = (left: Mark, right: Mark) =>
      runEnd(right) - runEnd(left);
    const opening = item.marks
      .filter((mark) => !open.some((entry) => entry.mark.key === mark.key))
      .sort(longestRunFirst);

    for (const mark of opening) {
      const node = { ...mark.container, children: [] } as MdContainer;

      own.add(node);
      target().push(node);
      open.push({ mark, node });
    }
    target().push(...item.content);
  });

  return mergePhrasing(withEdgesOutside(root, own), own);
};

type OwnContainers = WeakSet<MdRootContent>;

const isOwn = (
  own: OwnContainers,
  node: MdRootContent | undefined
): node is MdContainer => !!node && own.has(node);

const copyOwn = (
  own: OwnContainers,
  node: MdContainer,
  children: MdRootContent[]
): MdContainer => {
  const copy = { ...node, children } as MdContainer;

  own.add(copy);

  return copy;
};

const textsOf = (node: Descendant): Text[] =>
  TextApi.isText(node)
    ? [node]
    : 'children' in node
      ? node.children.flatMap(textsOf)
      : [];

const isMdMarkContainer = (node: MdRootContent): node is MdContainer =>
  node.type === 'delete' ||
  node.type === 'emphasis' ||
  node.type === 'mdxJsxTextElement' ||
  node.type === 'strong';

const takeEdgeWhitespace = (
  children: MdRootContent[],
  end: 'end' | 'start'
): MdRootContent[] => {
  const taken: MdRootContent[] = [];

  for (;;) {
    const index = end === 'start' ? 0 : children.length - 1;
    const edge = children[index];

    if (edge?.type === 'break') {
      children.splice(index, 1);
      taken.push(edge);
      continue;
    }
    if (edge?.type !== 'text') break;
    const spaces = (end === 'start' ? LEADING_SPACES : TRAILING_SPACES).exec(
      edge.value
    )?.[0];

    if (!spaces) break;
    taken.push({ type: 'text', value: spaces });
    const rest =
      end === 'start'
        ? edge.value.slice(spaces.length)
        : edge.value.slice(0, -spaces.length);

    if (rest) {
      children[index] = { ...edge, value: rest };
      break;
    }
    children.splice(index, 1);
  }

  return end === 'start' ? taken : taken.reverse();
};

/**
 * A delimiter run cannot open before or close after a space or a line break,
 * so the spaces and line breaks at the ends of a container are written
 * outside it.
 */
const withEdgesOutside = (
  nodes: readonly MdRootContent[],
  own: OwnContainers
): MdRootContent[] =>
  nodes.flatMap((node): MdRootContent[] => {
    if (!isOwn(own, node)) return [node];
    const children = withEdgesOutside(node.children, own);
    const before = takeEdgeWhitespace(children, 'start');
    const after = takeEdgeWhitespace(children, 'end');

    return [
      ...before,
      ...(children.some((child) => hasContent(child, own))
        ? [copyOwn(own, node, children)]
        : []),
      ...after,
    ];
  });

const hasContent = (node: MdRootContent, own: OwnContainers): boolean =>
  node.type === 'text' || node.type === 'inlineCode'
    ? node.value !== ''
    : !isOwn(own, node) ||
      (node.children as MdRootContent[]).some((child) =>
        hasContent(child, own)
      );

const sameContainer = (left: MdRootContent, right: MdRootContent) =>
  left.type === right.type &&
  (left.type !== 'mdxJsxTextElement' ||
    (left.name === (right as typeof left).name &&
      JSON.stringify(left.attributes) ===
        JSON.stringify((right as typeof left).attributes)));

const mergePhrasing = (
  nodes: readonly MdRootContent[],
  own: OwnContainers
): MdRootContent[] => {
  const merged: MdRootContent[] = [];

  for (const node of nodes) {
    const last = merged.at(-1);

    if (node.type === 'text' && node.value === '') continue;
    // Two code spans side by side would read as one span holding backticks.
    if (
      (last?.type === 'text' && node.type === 'text') ||
      (last?.type === 'inlineCode' && node.type === 'inlineCode')
    ) {
      merged[merged.length - 1] = { ...last, value: last.value + node.value };
    } else if (
      isOwn(own, last) &&
      isOwn(own, node) &&
      sameContainer(last, node)
    ) {
      merged[merged.length - 1] = copyOwn(
        own,
        last,
        mergePhrasing(
          [
            ...(last.children as MdRootContent[]),
            ...(node.children as MdRootContent[]),
          ],
          own
        )
      );
    } else if (isOwn(own, node)) {
      merged.push(copyOwn(own, node, mergePhrasing(node.children, own)));
    } else {
      merged.push(node);
    }
  }

  return merged;
};
