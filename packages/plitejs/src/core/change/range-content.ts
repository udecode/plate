import type { Descendant } from '../../interfaces/node';
import { countCoreWork } from '../work';
import type { DocumentIndex } from './document-index';

type ContentSchema = Readonly<{
  isVoid: (element: Descendant) => boolean;
}>;

const insideVoid = (
  voids: ReadonlyArray<[number, number]>,
  position: number
) => {
  let low = 0;
  let high = voids.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const [voidFrom, voidTo] = voids[middle];

    if (position < voidFrom) high = middle - 1;
    else if (position >= voidTo) low = middle + 1;
    else return true;
  }

  return false;
};

const FIRST_WINDOW = 64;

/** @internal */
export const coversContent = (
  index: DocumentIndex,
  from: number,
  to: number,
  schema: ContentSchema
) => {
  if (from >= to) return false;

  for (let width = FIRST_WINDOW; ; width *= 2) {
    const end = Math.min(to, from + width);

    if (coversContentUpTo(index, from, end, to, schema)) return true;
    if (end === to) return false;
  }
};

const coversContentUpTo = (
  index: DocumentIndex,
  from: number,
  end: number,
  to: number,
  schema: ContentSchema
) => {
  const entries = index.nodeRangesTouching(from, end);
  const voids: Array<[number, number]> = [];

  countCoreWork('contentSpanNodes', entries.length);
  for (const entry of entries) {
    if (
      entry.kind === 'text' ||
      !schema.isVoid(index.node(entry.path) as Descendant)
    ) {
      continue;
    }
    if (from <= entry.from && entry.to <= to) return true;
    voids.push([entry.from, entry.to]);
  }

  voids.sort(([a], [b]) => a - b);
  const outerVoids: Array<[number, number]> = [];

  for (const range of voids) {
    if (range[0] >= (outerVoids.at(-1)?.[1] ?? -1)) outerVoids.push(range);
  }

  return entries.some((entry) => {
    if (entry.kind !== 'text') return false;

    const start = Math.max(from, entry.contentFrom);

    return (
      start < Math.min(end, entry.contentTo) && !insideVoid(outerVoids, start)
    );
  });
};
