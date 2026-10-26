import { type Diff, DiffOp } from 'diff-match-patch-ts';
import * as Y from 'yjs';

import type { DocumentIndex, NodeList } from '../../core/change/document-index';
import type { EmptyTextRead, Retraction } from '../../core/change/retraction';
import {
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  type Text,
} from '../../index';
import {
  createYjsPropertyContext,
  createYjsVisibleChildrenReader,
  readPliteNodeFromYjs,
  removeYjsChild,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  type YjsWrite,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { setYjsElementAttributes } from './replacement';
import {
  alignSegments,
  createYjsRunEncoder,
  rewriteTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
  writeTextRuns,
  type YjsTextChain,
} from './text-runs';

type Cut = Readonly<{ from: number; to: number }>;

const withoutEmptyTextProperties = (node: Descendant): Descendant =>
  NodeApi.isText(node)
    ? node.text === ''
      ? { text: '' }
      : node
    : { ...node, children: node.children.map(withoutEmptyTextProperties) };

type Group =
  | { chain: Y.XmlText[]; diff: Diff[]; kind: 'text'; leaves: Text[] }
  | Readonly<{
      kind: 'element';
      node: Element;
      path: Path;
      stored: Y.XmlElement;
    }>;

const pathKey = (path: Path) => path.join(',');

const attributesOf = ({ children: _children, ...attributes }: Element) =>
  attributes;

const diffOf = (text: string, cuts: readonly Cut[]): Diff[] => {
  const diff: Diff[] = [];
  let at = 0;

  for (const { from, to } of cuts) {
    if (from > at) diff.push([DiffOp.Equal, text.slice(at, from)]);
    diff.push([DiffOp.Delete, text.slice(from, to)]);
    at = to;
  }
  if (at < text.length) diff.push([DiffOp.Equal, text.slice(at)]);

  return diff;
};

export const retractYjsRoot = (
  write: YjsWrite,
  base: DocumentIndex,
  expected: NodeList<Descendant>,
  retraction: Retraction,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null,
  readEmpty: EmptyTextRead,
  readStored: (block: Descendant) => Descendant
): boolean => {
  const { root } = write;
  const read = createYjsVisibleChildrenReader(root);
  const top = read(root);
  const gone = new Set(retraction.elements.map(pathKey));
  const cuts = new Map<string, Cut[]>();
  const edits: Array<() => void> = [];
  const removals: Array<() => void> = [];

  for (const cut of retraction.characters) {
    const key = pathKey(cut.path);

    cuts.set(key, [...(cuts.get(key) ?? []), cut]);
  }

  const plan = (
    stored: Y.XmlElement,
    was: Element,
    next: Element,
    path: Path,
    location: YjsPropertyLocation,
    retyped: boolean
  ): boolean => {
    const context = createYjsPropertyContext(next, location);
    const readsAsEmptyImport = (leaves: readonly Descendant[]) => {
      const empty = readEmpty([
        attributesOf(next),
        ...context.ancestors.map((type) => ({ type })),
      ]);

      return !!empty && areJsonLikeValuesEqual(leaves, [empty]);
    };

    edits.push(() =>
      setYjsElementAttributes(
        stored,
        attributesOf(was),
        attributesOf(next),
        (key) => isSetValued(next, key, context)
      )
    );

    const inner = {
      ancestors: [context.type, ...context.ancestors],
      path: context.path,
      root: context.root,
    };
    const retypes = retyped || was.type !== next.type;
    const segments = segmentPliteChildren(was.children);
    const targets = alignSegments(segments, segmentYjsChildren(read(stored)));

    if (!targets) return false;

    const groups: Group[] = [];

    for (const [index, segment] of segments.entries()) {
      const target = targets[index];

      if (segment.kind === 'element') {
        const at = [...path, segment.from];

        if (target?.kind !== 'element') return false;
        if (gone.has(pathKey(at))) {
          removals.push(() => removeYjsChild(write, stored, target.from));
        } else {
          groups.push({
            kind: 'element',
            node: segment.node,
            path: at,
            stored: target.node,
          });
        }
        continue;
      }

      let group = groups.at(-1);

      if (group?.kind !== 'text') {
        group = { chain: [], diff: [], kind: 'text', leaves: [] };
        groups.push(group);
      }
      if (target?.kind === 'text') group.chain.push(...target.chain);
      for (const [offset, leaf] of segment.leaves.entries()) {
        group.leaves.push(leaf);
        group.diff.push(
          ...diffOf(
            leaf.text,
            cuts.get(pathKey([...path, segment.from + offset])) ?? []
          )
        );
      }
    }

    if (groups.length === 0) return readsAsEmptyImport(next.children);

    const nextSegments = segmentPliteChildren(next.children);

    if (nextSegments.length !== groups.length) return false;

    return nextSegments.every((segment, index) => {
      const group = groups[index];

      if (group?.kind === 'element' && segment.kind === 'element') {
        return plan(
          group.stored,
          group.node,
          segment.node,
          group.path,
          { ...inner, path: [...inner.path, segment.from] },
          retypes
        );
      }
      if (group?.kind !== 'text' || segment.kind !== 'text') return false;

      const [first, ...rest] = group.chain;
      const kept = group.diff
        .flatMap(([operation, text]) =>
          operation === DiffOp.Equal ? [text] : []
        )
        .join('');

      if (kept !== segment.leaves.map((leaf) => leaf.text).join('')) {
        return false;
      }
      if (!first) return readsAsEmptyImport(segment.leaves);

      const chain: YjsTextChain = [first, ...rest];
      const encode = createYjsRunEncoder(isSetValued, {
        ...inner,
        offset: segment.from,
      });

      edits.push(() => {
        if (retypes) {
          rewriteTextRuns(chain, segment.leaves, encode, { diff: group.diff });
        } else {
          writeTextRuns(chain, group.leaves, segment.leaves, encode, {
            diff: group.diff,
          });
        }
      });

      return true;
    });
  };

  let removedBefore = 0;

  for (const block of retraction.blocks) {
    const stored = top[block];
    const was = base.child(block) as Element | undefined;

    if (
      !(stored instanceof Y.XmlElement) ||
      !was ||
      !areJsonLikeValuesEqual(
        withoutEmptyTextProperties(
          readStored(readPliteNodeFromYjs(root, stored))
        ),
        withoutEmptyTextProperties(was)
      )
    ) {
      return false;
    }
    if (gone.has(pathKey([block]))) {
      removedBefore += 1;
      removals.push(() => removeYjsChild(write, root, block));
      continue;
    }

    const next = expected.at(block - removedBefore) as Element | undefined;

    if (
      !next ||
      !plan(
        stored,
        was,
        next,
        [block],
        { ancestors: [], path: [block - removedBefore], root: schemaRoot },
        false
      )
    ) {
      return false;
    }
  }

  for (const edit of edits) edit();
  for (const remove of removals.reverse()) remove();

  return true;
};
