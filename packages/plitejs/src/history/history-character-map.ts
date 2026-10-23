import {
  getInternalDocumentRootChange,
  valueRootIndex,
  mapInternalDocumentChangePosition,
  type DocumentChange,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import { joinsOf } from '../core/change/join';
import {
  type DocumentChangeRelocation,
  getDocumentChangeRelocations,
} from '../core/change/mapping';
import { RootChange } from '../core/change/root-change';
import {
  isTextNode,
  nodeProps,
  type JsonEditorValue,
  type JsonNode,
  type JsonPoint,
} from '../core/change/tokens';
import { countCoreWork } from '../core/work';
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
  countCoreWork('walkedSlots', getDefined(path.at(-1)) - from + leaves.length);
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

type Projection = Readonly<{
  path: readonly number[];
  children: readonly JsonNode[];
  before: DocumentIndex;
  after: DocumentIndex;
  change: RootChange;
}>;

type Fragment = Readonly<{ from: number; to: number; target: CharacterSpan }>;

type Retained = Readonly<{ from: number; to: number; at: number }>;

const retainedSections = (change: RootChange) => {
  const sections: Retained[] = [];
  let beforePosition = 0;
  let afterPosition = 0;
  countCoreWork('sectionsWalked', change.data.length);
  change.data.forEach((_, section) => {
    const length = change.sections[section * 2];
    const inserted = change.sections[section * 2 + 1];
    if (inserted < 0 && length > 0) {
      sections.push({
        from: beforePosition,
        to: beforePosition + length,
        at: afterPosition,
      });
    }
    beforePosition += length;
    afterPosition += inserted < 0 ? length : inserted;
  });
  return sections;
};

const retainedRanges = (
  sections: readonly Retained[],
  from: number,
  to: number
) => {
  let low = 0;
  let high = sections.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (sections[middle].to <= from) low = middle + 1;
    else high = middle;
  }
  const ranges: Retained[] = [];
  for (let at = low; at < sections.length && sections[at].from < to; at += 1) {
    const section = sections[at];
    const start = Math.max(from, section.from);
    const end = Math.min(to, section.to);
    if (start < end) {
      ranges.push({
        from: start,
        to: end,
        at: section.at + start - section.from,
      });
    }
  }
  return ranges;
};

export const createCharacterCorrespondence = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange,
  root: string
) => {
  const source = valueRootIndex(before, root);
  const target = valueRootIndex(after, root);
  let joinedLines: ReadonlySet<number> | undefined;
  let relocations: readonly DocumentChangeRelocation[] | undefined;
  let retained: readonly Retained[] | undefined;
  const joinedChange = (line: Readonly<{ from: number }>) => {
    const rootChange = getInternalDocumentRootChange(change, root);

    joinedLines ??= new Set(
      rootChange
        ? joinsOf(rootChange, source).flatMap((join) => [
            join.first.from,
            join.second.from,
          ])
        : []
    );

    return rootChange && joinedLines.has(line.from) ? rootChange : undefined;
  };
  const parents = new Map<
    string,
    Projection | Readonly<{ joined: RootChange }> | null
  >();
  const parentPair = (path: readonly number[]) => {
    const parentPath = path.slice(0, -1);
    const key = parentPath.join('.');
    if (parents.has(key)) return parents.get(key) ?? null;
    const range = source.nodeRange(parentPath);
    const joined = joinedChange(range);
    if (joined) {
      parents.set(key, { joined });
      return { joined };
    }
    const mapped = mapInternalDocumentChangePosition(
      change,
      root,
      range.from,
      1,
      'after'
    );
    let nextPath =
      mapped === null ? undefined : target.nodeStartingAt(mapped)?.path;
    if (!nextPath) {
      relocations ??= getDocumentChangeRelocations(
        change,
        root,
        source,
        target
      );
      const relocation = relocations.find(
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
  const sourcePosition = (span: CharacterSpan, pair: Projection) => {
    const parent = source.node(span.path.slice(0, -1));
    if (isTextNode(parent)) throw new Error('A text host requires an element.');
    return (
      pair.before.nodeRange(
        projectedPath(parent.children, [getDefined(span.path.at(-1))])
      ).from + 1
    );
  };
  const targetHosts = new Map<
    string,
    ReadonlyArray<Readonly<{ offset: number; path: number[] }>>
  >();
  const targetHostOf = (path: readonly number[]) => {
    const parentPath = path.slice(0, -1);
    const key = parentPath.join('.');
    let hosts = targetHosts.get(key);
    if (!hosts) {
      const parent = target.node(parentPath);
      if (isTextNode(parent)) {
        throw new Error('A text host requires an element.');
      }
      const built: Array<Readonly<{ offset: number; path: number[] }>> = [];
      let host: number[] | null = null;
      let offset = 0;
      countCoreWork('walkedSlots', parent.children.length);
      parent.children.forEach((child, at) => {
        if (!isTextNode(child)) {
          host = null;
          return;
        }
        if (!host) {
          host = [...parentPath, at];
          offset = 0;
        }
        built[at] = { offset, path: host };
        offset += child.text?.length ?? 0;
      });
      hosts = built;
      targetHosts.set(key, hosts);
    }
    return getDefined(hosts[getDefined(path.at(-1))]);
  };
  const joinedFragments = (span: CharacterSpan, joined: RootChange) => {
    const host = textHostAt(source, span.path);
    const fragments: Fragment[] = [];
    retained ??= retainedSections(joined);
    const sections = retained;
    let base = 0;
    host.leaves.forEach((leaf, at) => {
      const length = leaf.text?.length ?? 0;
      const path = [
        ...host.path.slice(0, -1),
        getDefined(host.path.at(-1)) + at,
      ];
      const start = source.positionAt({ path, offset: 0 }) - base;
      const from = Math.max(span.from, base);
      const to = Math.min(span.to, base + length);
      base += length;
      for (const range of retainedRanges(sections, start + from, start + to)) {
        let mapped = range.at;
        const end = range.at + range.to - range.from;
        while (mapped < end) {
          const entry = target.textAt(mapped);
          if (!entry) break;
          const stop = Math.min(end, entry.contentTo);
          if (stop <= mapped) break;
          const { offset, path: next } = targetHostOf(entry.path);
          fragments.push({
            from: range.from - start + mapped - range.at,
            to: range.from - start + stop - range.at,
            target: {
              path: next,
              from: offset + mapped - entry.contentFrom,
              to: offset + stop - entry.contentFrom,
            },
          });
          mapped = stop;
        }
      }
    });
    return fragments;
  };
  return {
    fragments(span: CharacterSpan) {
      const pair = parentPair(span.path);
      if (!pair) return [];
      if ('joined' in pair) return joinedFragments(span, pair.joined);
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
      const fragments: Fragment[] = [];
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
      if (!pair || 'joined' in pair) return null;
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
