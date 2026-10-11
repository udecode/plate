import { normalizeSetValues } from '../../core/change/transform';
import { property, schema, target } from '../../core/schema-definition';
import type { EditorJsonValue } from '../../interfaces/json';
import type { Path } from '../../interfaces/path';
import type { FormatTag } from './layers';

export const AUTHORED_MARKS_KEY = 'authored';

type ContentMarkKind = 'delete' | 'insert';
type BoundaryMarkKind = 'join' | 'split';
type EnclosureMarkKind = 'unwrap' | 'wrap';

export type AuthoredMarkKind =
  | BoundaryMarkKind
  | ContentMarkKind
  | EnclosureMarkKind
  | 'format';

type MarkBase = Readonly<{ author: string; at: number; change: string }>;

/**
 * One half of a pending split of an inline element: `end` on the left half,
 * `start` on the right, which keeps the properties the split dropped. See
 * `cuts.ts`.
 */
export type CutTag = MarkBase &
  Readonly<{
    cut: string;
    kept?: Readonly<Record<string, EditorJsonValue>>;
    kind: 'split';
    side: 'end' | 'start';
  }>;

export type AuthoredMark =
  | (MarkBase &
      Readonly<{
        cut?: undefined;
        kind: Exclude<AuthoredMarkKind, 'format'>;
      }>)
  | CutTag
  | FormatTag;

const TEXT_KINDS: ReadonlySet<AuthoredMarkKind> = new Set([
  'delete',
  'format',
  'insert',
]);
const ELEMENT_KINDS: ReadonlySet<AuthoredMarkKind> = new Set([
  'delete',
  'format',
  'insert',
  'join',
  'split',
  'unwrap',
  'wrap',
]);

export class AuthoredMarkError extends Error {
  override name = 'AuthoredMarkError';
  readonly path: Path;

  constructor(message: string, path: Path) {
    super(message);
    this.path = path;
  }
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const FORMAT_FIELDS: ReadonlySet<string> = new Set([
  'at',
  'author',
  'before',
  'change',
  'id',
  'key',
  'kind',
  'over',
]);

const CUT_FIELDS: ReadonlySet<string> = new Set([
  'at',
  'author',
  'change',
  'cut',
  'kept',
  'kind',
  'side',
]);

const isCutTag = (value: Readonly<Record<string, unknown>>) =>
  typeof value.cut === 'string' &&
  value.cut.length > 0 &&
  (value.side === 'end' || value.side === 'start') &&
  (value.kept === undefined ||
    (isRecord(value.kept) && !Object.hasOwn(value.kept, AUTHORED_MARKS_KEY))) &&
  Object.keys(value).every((field) => CUT_FIELDS.has(field));

const isFormatTag = (value: Readonly<Record<string, unknown>>) => {
  const { id, key, over } = value;

  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof key === 'string' &&
    key.length > 0 &&
    key !== AUTHORED_MARKS_KEY &&
    (over === undefined ||
      (Array.isArray(over) &&
        over.every((item) => typeof item === 'string' && item.length > 0))) &&
    Object.keys(value).every((field) => FORMAT_FIELDS.has(field))
  );
};

const parseMark = (value: unknown): AuthoredMark | null => {
  if (!isRecord(value)) return null;

  const { at, author, change, kind } = value;

  if (
    typeof change !== 'string' ||
    change.length === 0 ||
    typeof author !== 'string' ||
    author.length === 0 ||
    typeof at !== 'number' ||
    !Number.isFinite(at) ||
    typeof kind !== 'string' ||
    !ELEMENT_KINDS.has(kind as AuthoredMarkKind)
  ) {
    return null;
  }
  if (kind === 'format') {
    return isFormatTag(value) ? (value as AuthoredMark) : null;
  }
  if (kind === 'split' && value.cut !== undefined) {
    return isCutTag(value) ? (value as AuthoredMark) : null;
  }

  return Object.keys(value).length === 4 ? (value as AuthoredMark) : null;
};

/** `node` with exactly `marks`, stored in their canonical set order. */
export const withAuthoredMarks = <T extends Readonly<Record<string, unknown>>>(
  node: T,
  marks: readonly AuthoredMark[]
) => {
  const { [AUTHORED_MARKS_KEY]: _marks, ...rest } = node;

  return marks.length > 0
    ? { ...rest, [AUTHORED_MARKS_KEY]: normalizeSetValues(marks) }
    : rest;
};

export const readAuthoredMarks = (node: unknown): readonly AuthoredMark[] => {
  if (!isRecord(node)) return [];

  const marks = node[AUTHORED_MARKS_KEY];

  return Array.isArray(marks) ? (marks as readonly AuthoredMark[]) : [];
};

export const findAuthoredMark = (
  nodes: readonly unknown[],
  change: string
): AuthoredMark | null => {
  for (const node of nodes) {
    const mark = readAuthoredMarks(node).find((item) => item.change === change);

    if (mark) return mark;
    if (isRecord(node) && Array.isArray(node.children)) {
      const nested = findAuthoredMark(node.children, change);

      if (nested) return nested;
    }
  }

  return null;
};

type MarkOwners = Map<string, Readonly<{ at: number; author: string }>>;

const visitMarks = (
  nodes: readonly unknown[],
  parent: Path,
  owners: MarkOwners,
  checked: WeakSet<object>
) => {
  nodes.forEach((node, index) => {
    const at = [...parent, index];

    if (!isRecord(node) || checked.has(node)) return;

    const raw = node[AUTHORED_MARKS_KEY];
    const isText = typeof node.text === 'string';

    if (raw !== undefined) {
      if (!Array.isArray(raw)) {
        throw new AuthoredMarkError('Review marks must be a list.', at);
      }
      for (const value of raw) {
        const mark = parseMark(value);

        if (!mark) {
          throw new AuthoredMarkError('A review mark is malformed.', at);
        }
        if (!(isText ? TEXT_KINDS : ELEMENT_KINDS).has(mark.kind)) {
          throw new AuthoredMarkError(
            `A ${mark.kind} mark cannot mark ${isText ? 'text' : 'an element'}.`,
            at
          );
        }

        const owner = owners.get(mark.change);

        if (!owner) {
          owners.set(mark.change, { at: mark.at, author: mark.author });
        } else if (owner.author !== mark.author || owner.at !== mark.at) {
          throw new AuthoredMarkError(
            `Change ${mark.change} has marks with different authors or times.`,
            at
          );
        }
      }
    }
    if (Array.isArray(node.children)) {
      visitMarks(node.children, at, owners, checked);
    }
    checked.add(node);
  });
};

/**
 * One change has one author and one creation time, so the leaves it marks can
 * merge. Unchanged nodes keep their identity, so each call visits only nodes
 * it has not seen, and change owners carry across calls.
 */
export const createAuthoredMarksValidator = () => {
  const owners: MarkOwners = new Map();
  const checked = new WeakSet<object>();

  return (children: readonly unknown[]) =>
    visitMarks(children, [], owners, checked);
};

const markValue = property.set(property.json());

export const authoredMarksSchema = Object.freeze({
  properties: [
    schema.textProperty(AUTHORED_MARKS_KEY, markValue, {
      copy: 'drop',
      inclusive: false,
      role: 'metadata',
    }),
    schema.elementProperty(AUTHORED_MARKS_KEY, markValue, {
      copy: 'drop',
      role: 'metadata',
      split: 'drop',
      // Every element in any root: the primary root or a named one.
      target: target.or(target.root(), target.not(target.root())),
    }),
  ],
});
