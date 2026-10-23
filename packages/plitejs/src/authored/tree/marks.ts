import type { SparseNodes } from '../../core/change/document-index';
import { normalizeSetValues } from '../../core/change/transform';
import { property, schema, target } from '../../core/schema-definition';
import { isEditorJsonValue } from '../../core/value-codec';
import type { EditorJsonValue } from '../../interfaces/json';
import type { Path } from '../../interfaces/path';
import { isEditingChange } from '../facts/editing';
import type { FormatTag } from './layers';

export const AUTHORED_MARKS_KEY = 'authored';

export const isAuthoredSetValued = (_node: unknown, key: string) =>
  key === AUTHORED_MARKS_KEY;

type ContentMarkKind = 'delete' | 'insert';
type BoundaryMarkKind = 'join' | 'split';
type EnclosureMarkKind = 'unwrap' | 'wrap';

export type AuthoredMarkKind =
  | BoundaryMarkKind
  | ContentMarkKind
  | EnclosureMarkKind
  | 'format';

export type MarkBase = Readonly<{
  author: string;
  at: number;
  change: string;
  /**
   * The incarnation this claim belongs to. A claim without one belongs to
   * `<change>@<at>`; a change id proposed again after its decision gets one.
   */
  inc?: string;
}>;

/** The context a node rests on: the pending insertions it sits inside. */
export type RestsOn = Readonly<{ ctx: string; kind: 'in' }>;

export type HeldDeletion = MarkBase & Readonly<{ kind: 'held' }>;

export type AuthoredMember = AuthoredMark | HeldDeletion | RestsOn;

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
        follows?: undefined;
        kind: Exclude<AuthoredMarkKind, 'format' | 'insert' | 'split'>;
      }>)
  | (MarkBase &
      Readonly<{
        cut?: undefined;
        /**
         * The incarnation of a pending join this block goes with: for a split,
         * the one the source line carried, or followed, when the split cut it;
         * for an inserted block, the one the block before it carries or goes
         * with, or else the one whose target and line it was written between.
         * Where that join takes its line, such as into a quote, the block lands
         * right after it, in document order among the join's other followers,
         * and the join never merges into it.
         */
        follows?: string;
        kind: 'insert' | 'split';
      }>)
  | CutTag
  | FormatTag;

/** @internal */
export const isContextInsertion = (mark: AuthoredMark) =>
  mark.kind === 'insert' && mark.follows === undefined;

export const isStructureChange = (mark: AuthoredMark) =>
  mark.kind === 'join' ||
  mark.kind === 'split' ||
  mark.kind === 'unwrap' ||
  mark.kind === 'wrap';

export const isUnwrap = (mark: AuthoredMark) => mark.kind === 'unwrap';

export const isEnclosureChange = (mark: AuthoredMark) =>
  isUnwrap(mark) || mark.kind === 'wrap';

export const isPlaceChange = (mark: AuthoredMark) =>
  isStructureChange(mark) || (mark.kind === 'format' && mark.key === 'type');

/**
 * Whether a mark on content between the halves of a cut can decide whether
 * they meet.
 */
export const isBetweenChange = (mark: AuthoredMark) =>
  mark.kind === 'insert' ||
  mark.kind === 'delete' ||
  mark.kind === 'split' ||
  mark.kind === 'join';

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
const STORED_EDITING_KINDS: ReadonlySet<AuthoredMember['kind']> = new Set([
  'join',
  'split',
]);

export class AuthoredMarkError extends Error {
  override name = 'AuthoredMarkError';
  readonly path: Path;

  constructor(message: string, path: Path, options?: ErrorOptions) {
    super(message, options);
    this.path = path;
  }
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const FORMAT_FIELDS: ReadonlySet<string> = new Set([
  'at',
  'author',
  'base',
  'before',
  'change',
  'id',
  'inc',
  'key',
  'kind',
  'over',
  'write',
]);

const CUT_FIELDS: ReadonlySet<string> = new Set([
  'at',
  'author',
  'change',
  'cut',
  'inc',
  'kept',
  'kind',
  'side',
]);

export const heldOf = ({ at, author, change, inc }: MarkBase): HeldDeletion =>
  inc === undefined
    ? { at, author, change, kind: 'held' }
    : { at, author, change, inc, kind: 'held' };

export const deletionOf = ({
  at,
  author,
  change,
  inc,
}: HeldDeletion): AuthoredMark =>
  inc === undefined
    ? { at, author, change, kind: 'delete' }
    : { at, author, change, inc, kind: 'delete' };

const isRestsOn = (value: unknown): value is RestsOn =>
  isRecord(value) && value.kind === 'in';

export const isClaim = (member: AuthoredMember): member is AuthoredMark =>
  member.kind !== 'in' && member.kind !== 'held';

const isCutTag = (value: Readonly<Record<string, unknown>>) =>
  typeof value.cut === 'string' &&
  value.cut.length > 0 &&
  (value.side === 'end' || value.side === 'start') &&
  (value.kept === undefined ||
    (isRecord(value.kept) && !Object.hasOwn(value.kept, AUTHORED_MARKS_KEY))) &&
  Object.keys(value).every((field) => CUT_FIELDS.has(field));

const LINK_FIELDS: ReadonlySet<string> = new Set(['id', 'write']);

const isFormatWrite = (write: unknown) =>
  isRecord(write) &&
  ((write.kind === 'remove' && Object.keys(write).length === 1) ||
    (write.kind === 'set' &&
      Object.keys(write).length === 2 &&
      Object.hasOwn(write, 'value') &&
      isEditorJsonValue(write.value)));

const isFormatLink = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  value.id.length > 0 &&
  isFormatWrite(value.write) &&
  Object.keys(value).every((field) => LINK_FIELDS.has(field));

const isFormatTag = (value: Readonly<Record<string, unknown>>) => {
  const { base, id, key, over, write } = value;

  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof key === 'string' &&
    key.length > 0 &&
    key !== AUTHORED_MARKS_KEY &&
    isFormatWrite(write) &&
    (over === undefined
      ? base === undefined
      : Array.isArray(over) &&
        over.length > 0 &&
        over.every(
          (step) =>
            Array.isArray(step) && step.length > 0 && step.every(isFormatLink)
        ) &&
        isFormatWrite(base)) &&
    Object.keys(value).every((field) => FORMAT_FIELDS.has(field))
  );
};

const parseMember = (value: unknown): AuthoredMember | null => {
  if (!isRecord(value)) return null;
  if (isRestsOn(value)) {
    return typeof value.ctx === 'string' &&
      value.ctx.length > 0 &&
      Object.keys(value).length === 2
      ? value
      : null;
  }

  const { at, author, change, inc, kind } = value;

  if (
    typeof change !== 'string' ||
    change.length === 0 ||
    typeof author !== 'string' ||
    author.length === 0 ||
    typeof at !== 'number' ||
    !Number.isFinite(at) ||
    (inc !== undefined && (typeof inc !== 'string' || inc.length === 0)) ||
    typeof kind !== 'string' ||
    (kind !== 'held' && !ELEMENT_KINDS.has(kind as AuthoredMarkKind))
  ) {
    return null;
  }
  if (kind === 'format') {
    return isFormatTag(value) ? (value as AuthoredMark) : null;
  }
  if (kind === 'split' && value.cut !== undefined) {
    return isCutTag(value) ? (value as AuthoredMark) : null;
  }

  const follows =
    kind === 'split' || kind === 'insert' ? value.follows : undefined;

  if (
    follows !== undefined &&
    (typeof follows !== 'string' || follows.length === 0)
  ) {
    return null;
  }

  return Object.keys(value).length ===
    4 + (inc === undefined ? 0 : 1) + (follows === undefined ? 0 : 1)
    ? (value as AuthoredMark | HeldDeletion)
    : null;
};

export const readMembers = (node: unknown): readonly AuthoredMember[] => {
  if (!isRecord(node)) return [];

  const members = node[AUTHORED_MARKS_KEY];

  return Array.isArray(members) ? (members as readonly AuthoredMember[]) : [];
};

export const withMembers = <T extends Readonly<Record<string, unknown>>>(
  node: T,
  members: readonly AuthoredMember[]
) => {
  const { [AUTHORED_MARKS_KEY]: _members, ...rest } = node;

  return members.length > 0
    ? { ...rest, [AUTHORED_MARKS_KEY]: normalizeSetValues(members) }
    : rest;
};

export const withAuthoredMarks = <T extends Readonly<Record<string, unknown>>>(
  node: T,
  marks: readonly AuthoredMark[]
) => {
  const members = readMembers(node);

  return withMembers(
    node,
    members.every(isClaim)
      ? marks
      : [...marks, ...members.filter((member) => !isClaim(member))]
  );
};

const NO_CONTEXTS: readonly RestsOn[] = Object.freeze([]);

export const readAuthoredMarks = (node: unknown): readonly AuthoredMark[] => {
  const members = readMembers(node);

  return members.every(isClaim) ? members : members.filter(isClaim);
};

export const readRestsOn = (node: unknown): readonly RestsOn[] => {
  const members = readMembers(node);

  return members.some(isRestsOn) ? members.filter(isRestsOn) : NO_CONTEXTS;
};

export const withRestsOn = <T extends Readonly<Record<string, unknown>>>(
  node: T,
  ctx: string | null
) =>
  withMembers(node, [
    ...readMembers(node).filter((member) => !isRestsOn(member)),
    ...(ctx === null ? [] : [{ ctx, kind: 'in' } as const]),
  ]);

type MarkOwners = Map<string, string>;

const visitMarks = (
  nodes: SparseNodes<unknown>,
  parent: Path,
  owners: MarkOwners,
  checked: WeakSet<object>,
  restsOn: (ctx: string, path: Path) => void
) => {
  nodes.forEach((node, index) => {
    if (!isRecord(node) || checked.has(node)) return;

    const at = [...parent, index];

    const raw = node[AUTHORED_MARKS_KEY];
    const isText = typeof node.text === 'string';

    if (raw !== undefined) {
      if (!Array.isArray(raw)) {
        throw new AuthoredMarkError('Review marks must be a list.', at);
      }
      for (const value of raw) {
        const member = parseMember(value);

        if (!member) {
          throw new AuthoredMarkError('A review mark is malformed.', at);
        }
        if (member.kind === 'in') {
          restsOn(member.ctx, at);
          continue;
        }
        const follows =
          member.kind === 'insert' && member.follows !== undefined;
        const stacked = member.kind === 'format' && member.over !== undefined;

        if (
          isEditingChange(member.change) &&
          !STORED_EDITING_KINDS.has(member.kind) &&
          !follows &&
          !stacked
        ) {
          throw new AuthoredMarkError(
            `An Editing mark of kind "${member.kind}" never stays stored; only a join, a split, an insertion that follows a join or a format written over other tags does.`,
            at
          );
        }
        if (follows && isText) {
          throw new AuthoredMarkError('Only a block follows a join.', at);
        }
        const kind = member.kind === 'held' ? 'delete' : member.kind;

        if (!(isText ? TEXT_KINDS : ELEMENT_KINDS).has(kind)) {
          throw new AuthoredMarkError(
            `A ${member.kind} mark cannot mark ${isText ? 'text' : 'an element'}.`,
            at
          );
        }

        const owner = owners.get(member.change);

        if (owner === undefined) {
          owners.set(member.change, member.author);
        } else if (owner !== member.author) {
          throw new AuthoredMarkError(
            `Change ${member.change} has marks with different authors.`,
            at
          );
        }
      }
    }
    if (Array.isArray(node.children)) {
      visitMarks(node.children, at, owners, checked, restsOn);
    }
    checked.add(node);
  });
};

/**
 * One change has one author, so the leaves it marks can merge. Unchanged
 * nodes keep their identity, so each call visits only nodes it has not seen,
 * and change owners carry across calls, even after the document stops holding
 * the change. `restsOn` sees each context a newly visited node rests on.
 */
export const createAuthoredMarksValidator = () => {
  const owners: MarkOwners = new Map();
  const checked = new WeakSet<object>();

  return {
    authorOf: (change: string) => owners.get(change) ?? null,
    validate: (
      children: SparseNodes<unknown>,
      restsOn: (ctx: string, path: Path) => void
    ) => visitMarks(children, [], owners, checked, restsOn),
  };
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
