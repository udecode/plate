import { snapshotEditorJsonValue } from '../core/value-codec';
import {
  authoredPositionsFromSpans,
  authoredPositionSpans,
  decodeAuthoredPosition,
  type AuthoredPositions,
  type AuthoredSpan,
} from './positions';
import {
  decodeRecordTree,
  records,
  recordTreeFromSortedEntries,
  type RecordTree,
} from './record-tree';
import type { AuthoredPositionRoots } from './steps';

type PositionNode = NonNullable<AuthoredPositions['root']>;
type SavedPositionNode = Readonly<{
  left: SavedPositionNode | null;
  right: SavedPositionNode | null;
  span: AuthoredSpan;
}>;
type SavedPositionRoot = Readonly<{
  birth: string | null;
  positions: Readonly<{
    deleted: AuthoredPositions['deleted'];
    root: SavedPositionNode | null;
  }>;
  present: boolean;
}>;

export type AuthoredPositionCheckpoint = RecordTree<SavedPositionRoot> | null;

type FlatSavedPositionRoot = Readonly<{
  birth: string | null;
  deleted: AuthoredPositions['deleted'];
  present: boolean;
  spans: readonly AuthoredSpan[];
}>;

export type FlatAuthoredPositionCheckpoint = ReadonlyArray<
  readonly [string, FlatSavedPositionRoot]
> | null;

const NODES = new WeakMap<PositionNode, SavedPositionNode>();
const ROOTS = new WeakMap<object, SavedPositionRoot>();
const PAGES = new WeakMap<
  NonNullable<AuthoredPositionRoots>,
  RecordTree<SavedPositionRoot>
>();

const encodeNode = (node: PositionNode | null): SavedPositionNode | null => {
  if (!node) return null;
  const previous = NODES.get(node);
  if (previous) return previous;
  const value = snapshotEditorJsonValue(
    {
      left: encodeNode(node.left),
      right: encodeNode(node.right),
      span: node.span,
    },
    'Authored position checkpoint node'
  );
  NODES.set(node, value);
  return value;
};

export function encodeAuthoredPositionRoots(
  roots: NonNullable<AuthoredPositionRoots>
): RecordTree<SavedPositionRoot>;
export function encodeAuthoredPositionRoots(
  roots: AuthoredPositionRoots
): AuthoredPositionCheckpoint;
export function encodeAuthoredPositionRoots(
  roots: AuthoredPositionRoots
): AuthoredPositionCheckpoint {
  if (!roots) return null;
  const previous = PAGES.get(roots);
  if (previous) return previous;
  const value: RecordTree<SavedPositionRoot> = snapshotEditorJsonValue(
    roots.kind === 'branch'
      ? {
          ...roots,
          children: roots.children.map((child) =>
            encodeAuthoredPositionRoots(child)
          ),
        }
      : {
          ...roots,
          entries: roots.entries.map(([key, root]) => {
            let saved = ROOTS.get(root);
            if (!saved) {
              saved = snapshotEditorJsonValue(
                {
                  birth: root.birth,
                  positions: {
                    deleted: root.positions.deleted,
                    root: encodeNode(root.positions.root),
                  },
                  present: root.present,
                },
                'Authored position checkpoint root'
              );
              ROOTS.set(root, saved);
            }
            return [key, saved] as const;
          }),
        },
    'Authored position checkpoint page'
  );
  PAGES.set(roots, value);
  return value;
}

const record = (
  input: unknown,
  keys?: readonly string[]
): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid authored position checkpoint.');
  }
  if (
    keys &&
    (Object.keys(input).length !== keys.length ||
      Object.keys(input).some((key) => !keys.includes(key)))
  ) {
    throw new Error('Invalid authored position checkpoint fields.');
  }
  return input as Record<string, unknown>;
};

const identity = (input: unknown): string => {
  if (typeof input !== 'string' || !input || input.includes('\u0000')) {
    throw new Error('Invalid authored position identity.');
  }
  return input;
};

const integer = (input: unknown, minimum = 0): number => {
  if (
    typeof input !== 'number' ||
    !Number.isSafeInteger(input) ||
    input < minimum
  ) {
    throw new Error('Invalid authored position length.');
  }
  return input;
};

const decodeDeletedPositions = (input: unknown) => {
  const deleted = decodeRecordTree(input, (entries) => {
    const decoded = decodeRecordTree(entries, (rawEntry) => {
      const entry = record(rawEntry, ['length', 'position']);
      return {
        length: integer(entry.length, 1),
        position: decodeAuthoredPosition(entry.position),
      };
    });
    if (!decoded) throw new Error('Empty authored deletion ancestry.');
    for (const [key, entry] of records(decoded)) {
      const offset = integer(Number(key));
      if (String(offset).padStart(16, '0') !== key) {
        throw new Error('Invalid authored deletion offset.');
      }
      integer(offset + entry.length);
    }
    return decoded;
  });
  for (const [origin] of records(deleted)) identity(origin);
  return deleted;
};

export const encodeFlatAuthoredPositionRoots = (
  roots: AuthoredPositionRoots
): FlatAuthoredPositionCheckpoint =>
  roots
    ? snapshotEditorJsonValue(
        [...records(roots)].map(([key, root]) => [
          key,
          {
            birth: root.birth,
            deleted: root.positions.deleted,
            present: root.present,
            spans: [...authoredPositionSpans(root.positions)].map(
              ({ span }) => span
            ),
          },
        ]),
        'Authored position checkpoint'
      )
    : null;

export const decodeFlatAuthoredPositionRoots = (
  input: unknown
): AuthoredPositionRoots => {
  if (input === null) return null;
  if (!Array.isArray(input)) {
    throw new Error('Invalid authored position checkpoint.');
  }
  const entries = input.map((entry) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new Error('Invalid authored position checkpoint.');
    }
    const key = identity(entry[0]);
    const root = record(entry[1], ['birth', 'deleted', 'present', 'spans']);
    if (typeof root.present !== 'boolean' || !Array.isArray(root.spans)) {
      throw new Error('Invalid authored position checkpoint.');
    }
    const positions = authoredPositionsFromSpans(
      root.spans.map(decodeAuthoredSpan),
      decodeDeletedPositions(root.deleted)
    );
    return [
      key,
      snapshotEditorJsonValue(
        {
          birth: root.birth === null ? null : identity(root.birth),
          positions,
          present: root.present,
        },
        'Authored position root'
      ),
    ] as const;
  });
  return recordTreeFromSortedEntries(entries);
};

export const decodeAuthoredSpan = (input: unknown): AuthoredSpan => {
  const value = record(input, [
    'birth',
    'length',
    'offset',
    'origin',
    'placement',
    'properties',
  ]);
  const length = integer(value.length, 1);
  const offset = integer(value.offset);
  integer(offset + length);
  return snapshotEditorJsonValue(
    {
      birth: value.birth === null ? null : identity(value.birth),
      length,
      offset,
      origin: identity(value.origin),
      placement: value.placement === null ? null : identity(value.placement),
      properties: Object.fromEntries(
        Object.entries(record(value.properties)).map(([key, owner]) => [
          key,
          identity(owner),
        ])
      ),
    },
    'Authored position span'
  );
};

export const decodeAuthoredPositionRoots = (
  input: unknown
): AuthoredPositionRoots => {
  const roots = decodeRecordTree(
    snapshotEditorJsonValue(input, 'Authored position checkpoint'),
    (raw) => {
      const root = record(raw, ['birth', 'positions', 'present']);
      if (typeof root.present !== 'boolean') {
        throw new Error('Invalid authored root presence.');
      }
      const saved = record(root.positions, ['deleted', 'root']);
      const spans: AuthoredSpan[] = [];
      let length = 0;
      const visit = (rawNode: unknown, depth = 0): number => {
        if (rawNode === null) return 0;
        if (depth > 128) {
          throw new Error('Invalid authored position tree depth.');
        }
        const node = record(rawNode, ['left', 'right', 'span']);
        const left = visit(node.left, depth + 1);
        const span = decodeAuthoredSpan(node.span);
        length = integer(length + span.length);
        spans.push(span);
        const right = visit(node.right, depth + 1);
        if (Math.abs(left - right) > 1) {
          throw new Error('Unbalanced authored position tree.');
        }
        return Math.max(left, right) + 1;
      };
      visit(saved.root);
      const deleted = decodeDeletedPositions(saved.deleted);
      const intervals = new Map<string, AuthoredSpan[]>();
      for (const span of spans) {
        const previous = intervals.get(span.origin) ?? [];
        previous.push(span);
        intervals.set(span.origin, previous);
      }
      for (const entries of intervals.values()) {
        entries.sort((left, right) => left.offset - right.offset);
        for (let index = 1; index < entries.length; index++) {
          if (
            entries[index].offset <
            entries[index - 1].offset + entries[index - 1].length
          ) {
            throw new Error('Overlapping authored origin spans.');
          }
        }
      }
      const positions = authoredPositionsFromSpans(spans, deleted);
      return snapshotEditorJsonValue(
        {
          birth: root.birth === null ? null : identity(root.birth),
          positions,
          present: root.present,
        },
        'Authored position root'
      );
    }
  );
  for (const [key] of records(roots)) identity(key);
  return roots;
};
