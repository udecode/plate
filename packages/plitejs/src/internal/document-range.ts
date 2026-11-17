import { unsafeDocumentRootKeys } from '../core/change/document-change';
import type { NamedRootKey } from '../interfaces/editor';
import type { Point } from '../interfaces/point';
import { RangeApi, type Range } from '../interfaces/range';
import { MAIN_ROOT_KEY } from './root-location';

export type DocumentRangeSource =
  | 'saved'
  | Readonly<{ view: NamedRootKey | undefined }>;

const isIndex = (value: number) => Number.isSafeInteger(value) && value >= 0;

const readPointRoot = (point: Point, source: DocumentRangeSource) => {
  if (
    !isIndex(point.offset) ||
    point.path.length === 0 ||
    ![...point.path].every(isIndex)
  ) {
    return null;
  }
  if (point.root === undefined) {
    return source === 'saved' ? MAIN_ROOT_KEY : (source.view ?? MAIN_ROOT_KEY);
  }
  if (point.root === '' || unsafeDocumentRootKeys.has(point.root)) return null;
  if (point.root === MAIN_ROOT_KEY) {
    return source === 'saved' ? MAIN_ROOT_KEY : null;
  }

  return point.root;
};

const toDocumentPoint = (point: Point, root: string): Point =>
  root === MAIN_ROOT_KEY
    ? { offset: point.offset, path: [...point.path] }
    : { offset: point.offset, path: [...point.path], root };

export const readDocumentRange = (
  value: unknown,
  source: DocumentRangeSource
): Range | null => {
  if (!RangeApi.isRange(value)) return null;
  const root = readPointRoot(value.anchor, source);

  if (root === null || readPointRoot(value.focus, source) !== root) {
    return null;
  }

  return {
    anchor: toDocumentPoint(value.anchor, root),
    focus: toDocumentPoint(value.focus, root),
  };
};
