import type { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import { PreparedTokenSliceStructureError } from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';

type Range = {
  container: readonly number[];
  from: number;
  /** The container's children the range touches, as a half-open span. */
  span: readonly [number, number];
  /** First and past-last section index. */
  sections: readonly [number, number];
  to: number;
};

export type ChangeRegionPart = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  change: RootChange;
}>;

const containerOf = (
  document: DocumentIndex,
  from: number,
  to: number
): readonly number[] => {
  let container: readonly number[] = [];

  for (const entry of document.openContextAt(from)) {
    if (
      entry.kind !== 'element' ||
      from < entry.contentFrom ||
      to > entry.contentTo
    ) {
      break;
    }
    container = entry.path;
  }

  return container;
};

const childSpan = (
  document: DocumentIndex,
  container: readonly number[],
  from: number,
  to: number
): readonly [number, number] => {
  const count = getDefined(document.node(container).children).length;
  let lo = 0;

  while (lo < count && document.childPosition(container, lo + 1) <= from) {
    lo += 1;
  }
  if (from === to && document.childPosition(container, lo) === from) {
    return [lo, lo];
  }

  let hi = lo + 1;

  while (hi < count && document.childPosition(container, hi) < to) hi += 1;

  return [lo, Math.min(hi, count)];
};

const contains = (outer: Range, inner: Range) =>
  inner.container.length > outer.container.length &&
  outer.container.every((index, at) => inner.container[at] === index) &&
  outer.span[0] <= inner.container[outer.container.length] &&
  inner.container[outer.container.length] < outer.span[1];

const sameRegion = (left: Range, right: Range) =>
  (left.container.length === right.container.length &&
    left.container.every((index, at) => right.container[at] === index) &&
    left.span[0] < right.span[1] &&
    right.span[0] < left.span[1]) ||
  contains(left, right) ||
  contains(right, left);

/**
 * Split a change into one part per region: a run of siblings under the
 * deepest element that holds its edits. An edit to an element's own tokens
 * stays with every edit inside that element, so a retype and its children
 * lower together. Parts run from the last region to the first, each against
 * the document the parts before it leave. Null when the change has one
 * region or a part does not stand alone, as the two ends of a wrap do not.
 */
export const splitChangeRegions = (
  change: RootChange,
  before: DocumentIndex,
  topSpan: (from: number, to: number) => readonly [number, number]
): ChangeRegionPart[] | null => {
  const ranges: Range[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];

    if (change.sections[index + 1] === -1) {
      position += length;
      continue;
    }

    const last = ranges.at(-1);

    if (last && last.sections[1] === index) {
      last.to = position + length;
      last.sections = [last.sections[0], index + 2];
    } else {
      ranges.push({
        container: [],
        from: position,
        sections: [index, index + 2],
        span: [0, 0],
        to: position + length,
      });
    }
    position += length;
  }
  if (ranges.length < 2) return null;

  for (const range of ranges) {
    range.container = containerOf(before, range.from, range.to);
    range.span =
      range.container.length === 0
        ? topSpan(range.from, range.to)
        : childSpan(before, range.container, range.from, range.to);
  }

  const groups: Range[][] = [];

  for (const range of ranges) {
    const joined = groups.filter((group) =>
      group.some((other) => sameRegion(other, range))
    );
    const merged = [...joined.flat(), range];

    for (const group of joined) groups.splice(groups.indexOf(group), 1);
    groups.push(merged);
  }
  if (groups.length < 2) return null;

  const sectionsOf = (group: readonly Range[]) => {
    const sections: number[] = [];
    const data: SectionData[] = [];
    const owned = new Set(
      group.flatMap(({ sections: [from, to] }) =>
        Array.from({ length: (to - from) / 2 }, (_, at) => from + at * 2)
      )
    );

    for (let index = 0; index < change.sections.length; index += 2) {
      if (owned.has(index)) {
        addSection(
          sections,
          data,
          change.sections[index],
          change.sections[index + 1],
          change.data[index / 2] ?? null
        );
      } else {
        addSection(sections, data, change.sections[index], -1, null);
      }
    }

    return RootChange.fromSections(sections, data);
  };
  const ordered = groups
    .map((group) => ({
      from: Math.min(...group.map(({ from }) => from)),
      group,
      to: Math.max(...group.map(({ to }) => to)),
    }))
    .sort((left, right) => right.from - left.from);

  if (
    ordered.some(({ to }, index) => index > 0 && ordered[index - 1].from < to)
  ) {
    return null;
  }

  const parts: ChangeRegionPart[] = [];
  let document = before;

  for (const { group } of ordered) {
    const part = sectionsOf(group).resizeTrailingDocument(document.length);

    if (!part) return null;

    let after: DocumentIndex;

    try {
      after = part.apply(document);
    } catch (error) {
      if (error instanceof PreparedTokenSliceStructureError) return null;
      throw error;
    }
    parts.push({ after, before: document, change: part });
    document = after;
  }

  return parts;
};

/**
 * Whether `change` edits the element at `path` of `document`: its own
 * properties, a replacement inside its content, or a property edit of a node
 * it holds. An insert beside it does not count.
 */
export const editsNodeOf = (
  change: RootChange,
  document: DocumentIndex,
  path: readonly number[]
) => {
  const { from, to } = document.nodeRange(path);
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const end = position + length;

    if (
      change.sections[index + 1] !== -1 &&
      (length === 0
        ? from < position && position < to
        : position < to && end > from)
    ) {
      return true;
    }
    position = end;
  }

  return false;
};
