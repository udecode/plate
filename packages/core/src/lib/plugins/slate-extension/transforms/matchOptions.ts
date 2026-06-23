import type { Path } from '@platejs/slate';

export type PlateMatchPredicate = (node: unknown, path: Path) => boolean;

export type PlateMatchObject = Record<string, readonly unknown[] | unknown>;

export type PlateNodeMatch = PlateMatchObject | PlateMatchPredicate;

const toArray = (value: readonly unknown[] | unknown) =>
  Array.isArray(value) ? value : [value];

const matchesObject = (node: unknown, match: PlateMatchObject) => {
  if (node === null || typeof node !== 'object') return false;

  const record = node as Record<string, unknown>;

  return Object.entries(match).every(([key, value]) =>
    toArray(value).includes(record[key])
  );
};

export const combinePlateMatchOptions =
  (
    baseMatch?: PlateMatchPredicate,
    match?: PlateNodeMatch
  ): PlateMatchPredicate =>
  (node, path) =>
    (!baseMatch || baseMatch(node, path)) &&
    (!match ||
      (typeof match === 'function'
        ? match(node, path)
        : matchesObject(node, match)));
