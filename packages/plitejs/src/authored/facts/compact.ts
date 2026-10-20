import { canonicalJsonKey } from '../../core/change/transform';
import {
  deriveValue,
  getValueRecords,
  showValueRecords,
  withoutRecordSet,
} from '../../core/record-store';
import { hashSchemaIdentityString } from '../../core/schema-compiler';
import type { EditorDocumentRecords } from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import { countLedgerWork } from '../ledger/work';
import {
  isContextInsertion,
  type MarkBase,
  readAuthoredMarks,
  readRestsOn,
  withAuthoredMarks,
  withRestsOn,
} from '../tree/marks';
import {
  claimsOf,
  contentRootsOf,
  contextFor,
  factsOf,
  insertionsOf,
  membersOf,
  type NodesPerIncarnation,
} from './facts';
import {
  CONTEXTS,
  type ContextRecord,
  incarnationOf,
  memberOf,
  putContexts,
} from './records';

type Node = Readonly<Record<string, unknown>>;

type Value = Readonly<{
  children: readonly unknown[];
  records?: EditorDocumentRecords;
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

const childrenOf = (node: unknown): readonly unknown[] | null => {
  const children = (node as Node | null)?.children;

  return Array.isArray(children) ? children : null;
};

const mapNodes = (
  nodes: readonly unknown[],
  rewrite: (node: Node) => Node
): readonly unknown[] => {
  let changed = false;
  const next = nodes.map((node) => {
    const children = childrenOf(node);
    const mappedChildren = children ? mapNodes(children, rewrite) : null;
    const withChildren =
      mappedChildren && mappedChildren !== children
        ? { ...(node as Node), children: mappedChildren }
        : (node as Node);
    const rewritten = rewrite(withChildren);

    if (rewritten !== node) changed = true;

    return rewritten;
  });

  return changed ? next : nodes;
};

const mapValue = <V extends Value>(
  value: V,
  rewrite: (node: Node) => Node
): V =>
  deriveValue(value, {
    children: mapNodes(value.children, rewrite),
    ...(value.roots
      ? {
          roots: Object.fromEntries(
            Object.entries(value.roots).map(([root, nodes]) => [
              root,
              mapNodes(nodes, rewrite),
            ])
          ),
        }
      : {}),
  } as Partial<V>);

const insertsOf = (node: unknown) =>
  readAuthoredMarks(node).filter(isContextInsertion);

const memberHash = (member: MarkBase) =>
  hashSchemaIdentityString(canonicalJsonKey(memberOf(member)));

export type Carried = (insertion: MarkBase) => number;

export const carriedIn = (value: Value): Carried => {
  let counts: NodesPerIncarnation | undefined;

  return (insertion) =>
    (counts ??= insertionsOf(value).counts).get(incarnationOf(insertion)) ?? 0;
};

export const outerToInner = <M extends MarkBase>(
  insertions: readonly M[],
  carried: Carried
): M[] =>
  insertions.toSorted(
    (left, right) =>
      carried(right) - carried(left) ||
      memberHash(left).localeCompare(memberHash(right))
  );

// Two peers compacting one node at once leave two contexts on it in a
// set-valued room.
const isStacked = (node: unknown) =>
  insertsOf(node).length > 1 || readRestsOn(node).length > 1;

const STACKED = new WeakMap<object, boolean>();

const holdsStacked = (node: unknown): boolean => {
  if (typeof node !== 'object' || node === null) return false;

  let stacked = STACKED.get(node);

  if (stacked === undefined) {
    if (isStacked(node)) stacked = true;
    else {
      const children = childrenOf(node) ?? [];
      const at = children.findIndex(holdsStacked);

      countLedgerWork('summaryChildren', at === -1 ? children.length : at + 1);
      stacked = at !== -1;
    }
    STACKED.set(node, stacked);
  }

  return stacked;
};

export type TopLevelIndicesByRoot = ReadonlyMap<string, readonly number[]>;

export const compactClaims = <V extends Value>(
  value: V,
  blocks?: TopLevelIndicesByRoot
): V => {
  const targets = [...contentRootsOf(value)].map(
    ([root, nodes]) =>
      [
        root,
        nodes,
        blocks
          ? (blocks.get(root) ?? [])
          : Array.from({ length: nodes.length }, (_, index) => index),
      ] as const
  );

  if (
    !targets.some(([, nodes, at]) =>
      at.some((index) => holdsStacked(nodes.at(index)))
    )
  ) {
    return value;
  }

  const facts = factsOf(value);
  const carried = carriedIn(value);
  const minted = new Map<string, ContextRecord>();
  const rewrite = (node: Node): Node => {
    if (!isStacked(node)) return node;

    const own = insertsOf(node);
    const members = outerToInner(
      [
        ...new Map(
          claimsOf(node, facts)
            .filter(isContextInsertion)
            .map((claim) => [incarnationOf(claim), memberOf(claim)])
        ).values(),
      ],
      carried
    );
    const inner = getDefined(members.at(-1));
    const { ctx, records } = contextFor(facts, members.slice(0, -1));

    for (const record of records) minted.set(record.ctx, record);

    return withRestsOn(
      withAuthoredMarks(node, [
        ...readAuthoredMarks(node).filter((mark) => !isContextInsertion(mark)),
        own.find((mark) => incarnationOf(mark) === incarnationOf(inner)) ?? {
          ...inner,
          kind: 'insert',
        },
      ]),
      ctx
    );
  };
  const compacted = new Map(
    targets.flatMap(([root, nodes, at]) => {
      let next: unknown[] | null = null;

      for (const index of at) {
        const node = nodes.at(index);

        if (!holdsStacked(node)) continue;
        next ??= nodes.slice();
        next[index] = mapNodes([node], rewrite)[0];
      }

      return next ? [[root, next] as const] : [];
    })
  );
  const children = compacted.get('main');

  return deriveValue(
    value,
    {
      ...(children ? { children } : {}),
      ...(value.roots
        ? {
            roots: Object.fromEntries(
              Object.entries(value.roots).map(([root, nodes]) => [
                root,
                compacted.get(root) ?? nodes,
              ])
            ),
          }
        : {}),
    } as Partial<V>,
    putContexts(minted.values())
  );
};

export const expandContexts = <V extends Value>(value: V): V => {
  const facts = factsOf(value);
  const expanded = mapValue(value, (node) => {
    const contexts = readRestsOn(node);

    if (contexts.length === 0) return node;

    const members = contexts.flatMap(({ ctx }) => membersOf(facts, ctx));

    return withRestsOn(
      withAuthoredMarks(node, [
        ...readAuthoredMarks(node),
        ...members.map((member) => ({ ...member, kind: 'insert' as const })),
      ]),
      null
    );
  });

  return showValueRecords(
    { ...expanded },
    withoutRecordSet(getValueRecords(value), CONTEXTS)
  );
};
