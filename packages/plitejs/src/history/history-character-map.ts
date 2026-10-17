import {
  valueRootIndex,
  mapInternalDocumentChangePosition,
  type DocumentChange,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import { getDocumentChangeRelocations } from '../core/change/mapping';
import { RootChange } from '../core/change/root-change';
import {
  isTextNode,
  nodeProps,
  type JsonEditorValue,
  type JsonNode,
  type JsonPoint,
} from '../core/change/tokens';
import { getDefined } from '../internal/get-defined';

export type CharacterSpan = Readonly<{
  path: readonly number[];
  from: number;
  to: number;
}>;

const projections = new WeakMap<object, readonly JsonNode[]>();
const project = (children: readonly JsonNode[]): readonly JsonNode[] => {
  const cached = projections.get(children);
  if (cached) return cached;
  const result: JsonNode[] = [];
  for (const child of children) {
    if (isTextNode(child)) {
      const previous = result.at(-1);
      if (previous && isTextNode(previous)) {
        result[result.length - 1] = { text: previous.text + child.text };
      } else result.push({ text: child.text });
    } else {
      result.push({ ...nodeProps(child), children: project(child.children) });
    }
  }
  projections.set(children, result);
  return result;
};

export const textHostAt = (index: DocumentIndex, path: readonly number[]) => {
  const parent = index.node(path.slice(0, -1));
  if (isTextNode(parent)) throw new Error('A text host requires an element.');
  let from = getDefined(path.at(-1));
  while (from > 0 && isTextNode(parent.children[from - 1])) from -= 1;
  const leaves: JsonNode[] = [];
  for (
    let at = from;
    at < parent.children.length && isTextNode(parent.children[at]);
    at += 1
  ) {
    leaves.push(parent.children[at]);
  }
  return {
    path: [...path.slice(0, -1), from],
    leaves,
    text: leaves.map((leaf) => leaf.text).join(''),
  };
};

const projectedPath = (
  children: readonly JsonNode[],
  path: readonly number[]
): number[] => {
  const result: number[] = [];
  let current = children;
  for (const childIndex of path) {
    let projected = -1;
    let wasText = false;
    for (let at = 0; at <= childIndex; at += 1) {
      const text = isTextNode(current[at]);
      if (!text || !wasText) projected += 1;
      wasText = text;
    }
    result.push(projected);
    const node = current[childIndex];
    current = isTextNode(node) ? [] : node.children;
  }
  return result;
};

const actualPath = (
  children: readonly JsonNode[],
  path: readonly number[]
): number[] => {
  const result: number[] = [];
  let current = children;
  for (const childIndex of path) {
    let projected = -1;
    let wasText = false;
    for (let at = 0; at < current.length; at += 1) {
      const text = isTextNode(current[at]);
      if (!text || !wasText) projected += 1;
      if (projected === childIndex) {
        result.push(at);
        const node = current[at];
        current = isTextNode(node) ? [] : node.children;
        break;
      }
      wasText = text;
    }
  }
  return result;
};

export const createCharacterCorrespondence = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange,
  root: string
) => {
  const source = valueRootIndex(before, root);
  const target = valueRootIndex(after, root);
  const parents = new Map<
    string,
    Readonly<{
      path: readonly number[];
      children: readonly JsonNode[];
      before: DocumentIndex;
      after: DocumentIndex;
      change: RootChange;
    }> | null
  >();
  const parentPair = (path: readonly number[]) => {
    const parentPath = path.slice(0, -1);
    const key = parentPath.join('.');
    if (parents.has(key)) return parents.get(key) ?? null;
    const range = source.nodeRange(parentPath);
    const position = mapInternalDocumentChangePosition(
      change,
      root,
      range.from,
      1,
      'after'
    );
    let nextPath =
      position === null ? undefined : target.nodeStartingAt(position)?.path;
    if (!nextPath) {
      const relocation = getDocumentChangeRelocations(
        change,
        root,
        source,
        target
      ).find(
        (move) =>
          move.path.length <= parentPath.length &&
          move.path.every((part, at) => part === parentPath[at])
      );
      if (relocation) {
        nextPath = [
          ...relocation.targetPath,
          ...parentPath.slice(relocation.path.length),
        ];
      }
    }
    const previous = source.node(parentPath);
    const next = nextPath ? target.node(nextPath) : null;
    if (!nextPath || isTextNode(previous) || !next || isTextNode(next)) {
      parents.set(key, null);
      return null;
    }
    const from = DocumentIndex.fromValue(project(previous.children));
    const to = DocumentIndex.fromValue(project(next.children));
    const pair = {
      path: nextPath,
      children: next.children,
      before: from,
      after: to,
      change: RootChange.between(from, to),
    };
    parents.set(key, pair);
    return pair;
  };
  const sourcePosition = (
    span: CharacterSpan,
    pair: NonNullable<ReturnType<typeof parentPair>>
  ) => {
    const parent = source.node(span.path.slice(0, -1));
    if (isTextNode(parent)) throw new Error('A text host requires an element.');
    return (
      pair.before.nodeRange(
        projectedPath(parent.children, [getDefined(span.path.at(-1))])
      ).from + 1
    );
  };
  return {
    fragments(span: CharacterSpan) {
      const pair = parentPair(span.path);
      if (!pair) return [];
      const start = sourcePosition(span, pair);
      if (pair.change.empty) {
        const entry = pair.after.textAt(start);
        return entry
          ? [
              {
                from: span.from,
                to: span.to,
                target: {
                  path: [
                    ...pair.path,
                    ...actualPath(pair.children, entry.path),
                  ],
                  from: span.from,
                  to: span.to,
                },
              },
            ]
          : [];
      }
      const fragments: Array<
        Readonly<{ from: number; to: number; target: CharacterSpan }>
      > = [];
      let beforePosition = 0;
      let afterPosition = 0;
      pair.change.data.forEach((_, section) => {
        const length = pair.change.sections[section * 2];
        const inserted = pair.change.sections[section * 2 + 1];
        if (inserted < 0) {
          const from = Math.max(start + span.from, beforePosition);
          const to = Math.min(start + span.to, beforePosition + length);
          let mapped = afterPosition + from - beforePosition;
          while (mapped < afterPosition + to - beforePosition) {
            const entry = pair.after.textAt(mapped);
            if (!entry) break;
            const end = Math.min(
              afterPosition + to - beforePosition,
              entry.contentTo
            );
            if (end <= mapped) break;
            fragments.push({
              from: beforePosition + mapped - afterPosition - start,
              to: beforePosition + end - afterPosition - start,
              target: {
                path: [...pair.path, ...actualPath(pair.children, entry.path)],
                from: mapped - entry.contentFrom,
                to: end - entry.contentFrom,
              },
            });
            mapped = end;
          }
        }
        beforePosition += length;
        afterPosition += inserted < 0 ? length : inserted;
      });
      return fragments;
    },
    point(point: JsonPoint, association: -1 | 1): JsonPoint | null {
      const pair = parentPair(point.path);
      if (!pair) return null;
      const host = textHostAt(source, point.path);
      let { offset } = point;
      for (
        let at = getDefined(host.path.at(-1));
        at < getDefined(point.path.at(-1));
        at += 1
      ) {
        offset +=
          source.node([...point.path.slice(0, -1), at]).text?.length ?? 0;
      }
      const position =
        sourcePosition({ ...host, from: 0, to: 0 }, pair) + offset;
      const mapped = pair.change.empty
        ? position
        : pair.change.mapPos(position, association);
      const projected =
        mapped === null ? null : pair.after.pointAt(mapped, association);
      if (!projected) return null;
      const path = [...pair.path, ...actualPath(pair.children, projected.path)];
      const next = textHostAt(target, path);
      let remaining = projected.offset;
      for (let at = 0; at < next.leaves.length; at += 1) {
        const length = next.leaves[at].text?.length ?? 0;
        if (
          remaining < length ||
          (remaining === length && association < 0) ||
          at === next.leaves.length - 1
        ) {
          return {
            path: [
              ...next.path.slice(0, -1),
              getDefined(next.path.at(-1)) + at,
            ],
            offset: remaining,
          };
        }
        remaining -= length;
      }
      return null;
    },
  };
};
