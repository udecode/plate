import { isMetadataRootKey } from '../../internal/root-location';
import {
  decideKey,
  type FormatTag,
  type LayerOutcome,
  type LayerValue,
} from '../tree/layers';
import {
  type AuthoredMember,
  deletionOf,
  heldOf,
  isClaim,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import { createDependencies, type Dependencies } from './dependencies';
import { claimsOf, outcomeOf, type ReviewFacts } from './facts';
import { CONTEXTS_ROOT, contextElementOf, incarnationOf } from './records';

type Node = Readonly<Record<string, unknown>> & {
  children?: readonly Node[];
  text?: string;
};

type Value = Readonly<{
  children: readonly unknown[];
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

export type SettleScope = 'document' | ReadonlyMap<string, ReadonlySet<number>>;

type Pass = Readonly<{
  /** Writes what a node's insertions rest on once some of them are accepted. */
  dependencies: Dependencies;
  facts: ReviewFacts;
  reopenedRejections: Set<string>;
  returnsHeld: boolean;
}>;

const settleFormats = (
  node: Node,
  tags: readonly FormatTag[],
  facts: ReviewFacts
) => {
  const outcomes = new Map(tags.map((tag) => [tag, outcomeOf(facts, tag)]));
  const outcome: LayerOutcome = (change) => {
    for (const [tag, result] of outcomes) {
      if (tag.change === change && result !== 'pending') return result;
    }

    return 'keep';
  };
  const dropped = new Set<FormatTag>();
  const props: Record<string, unknown> = {};

  for (const key of new Set(tags.map((tag) => tag.key))) {
    const onKey = tags.filter((tag) => tag.key === key);

    if (onKey.every((tag) => outcomes.get(tag) === 'pending')) continue;

    const decision = decideKey(node[key] as LayerValue, onKey, outcome);

    if (decision.waits.length > 0) continue;
    for (const tag of onKey) {
      if (!decision.kept.includes(tag)) dropped.add(tag);
    }
    if (decision.value.kind === 'set') props[key] = decision.value.value;
  }

  return { dropped, props };
};

const settleNode = (node: Node, pass: Pass): Node | null => {
  const members = readMembers(node);

  if (members.length === 0) return node;

  const { facts } = pass;
  const isText = typeof node.text === 'string';
  const { dropped, props } = settleFormats(
    node,
    readAuthoredMarks(node).filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    ),
    facts
  );
  let changed = dropped.size > 0;
  const kept: AuthoredMember[] = [];
  // An accepted insertion leaves the node, whether it is a claim or a member
  // of the context the node rests on.
  const inserts = claimsOf(node, facts).filter(
    (mark) => mark.kind === 'insert'
  );
  const pendingInserts = inserts.filter(
    (mark) => outcomeOf(facts, mark) !== 'accept'
  );
  const insertsSettled = pendingInserts.length < inserts.length;

  for (const member of members) {
    if (member.kind === 'format' && dropped.has(member)) continue;
    if (member.kind === 'in' || member.kind === 'insert') {
      if (!insertsSettled) kept.push(member);
      continue;
    }
    if (member.kind === 'held' && !pass.returnsHeld) {
      kept.push(member);
      continue;
    }

    const claim = member.kind === 'held' ? deletionOf(member) : member;
    const outcome = outcomeOf(facts, claim);

    if (claim.kind === 'delete') {
      if (outcome === 'accept' && isText) return null;
      if (outcome === 'reject') {
        kept.push(member.kind === 'held' ? member : heldOf(claim));
        if (member.kind !== 'held') changed = true;
        continue;
      }
      if (facts.verdicts.get(incarnationOf(claim))?.has('reject')) {
        pass.reopenedRejections.add(incarnationOf(claim));
      }
      if (member.kind === 'held') changed = true;
      kept.push(claim);
      continue;
    }
    kept.push(claim);
  }

  if (!changed && !insertsSettled) return node;

  const next: Record<string, unknown> = { ...node };

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }

  return insertsSettled
    ? pass.dependencies.props(withMembers(next, kept), [
        ...kept.filter(isClaim),
        ...pendingInserts,
      ])
    : withMembers(next, kept);
};

const settleNodes = (nodes: readonly Node[], pass: Pass): readonly Node[] => {
  let changed = false;
  const next: Node[] = [];

  for (const node of nodes) {
    const settled = settleNode(node, pass);

    if (!settled) {
      changed = true;
      continue;
    }

    const children = settled.children && settleNodes(settled.children, pass);
    const result =
      children && children !== settled.children
        ? { ...settled, children }
        : settled;

    if (result !== node) changed = true;
    next.push(result);
  }

  if (!changed) return nodes;
  if (
    next.length === 0 &&
    nodes.some((node) => typeof node.text === 'string')
  ) {
    return [{ text: '' }];
  }

  return next;
};

const settleBlocks = (
  children: readonly Node[],
  pass: Pass,
  blocks: ReadonlySet<number> | undefined
) => {
  if (!blocks) return children;

  let next: Node[] | null = null;

  for (const index of blocks) {
    const block = children[index];

    if (!block) continue;

    const [settled] = settleNodes([block], pass);

    if (settled !== block) {
      next ??= [...children];
      next[index] = settled;
    }
  }

  return next ?? children;
};

/**
 * Returning a held deletion asks which changes still insert, which `facts`
 * answers by walking the whole document unless an index backs it, so a block
 * scope returns held deletions only with `returnsHeld`.
 */
export const settleValue = <V extends Value>(
  value: V,
  facts: ReviewFacts,
  scope: SettleScope,
  {
    returnsHeld = scope === 'document',
  }: Readonly<{ returnsHeld?: boolean }> = {}
): Readonly<{ reopenedRejections: ReadonlySet<string>; value: V | null }> => {
  const pass: Pass = {
    dependencies: createDependencies(facts),
    facts,
    reopenedRejections: new Set(),
    returnsHeld,
  };

  if (facts.verdicts.size === 0) {
    return { reopenedRejections: pass.reopenedRejections, value: null };
  }

  const settleIn = (root: string, nodes: readonly Node[]) =>
    scope === 'document'
      ? settleNodes(nodes, pass)
      : settleBlocks(nodes, pass, scope.get(root));
  const children = settleIn('main', value.children as readonly Node[]);
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, nodes]) =>
      [
        root,
        nodes,
        isMetadataRootKey(root)
          ? nodes
          : settleIn(root, nodes as readonly Node[]),
      ] as const
  );
  const contexts = pass.dependencies.minted().map(contextElementOf);
  const settledRoots = new Map(
    roots.map(([root, , settled]) => [root, settled])
  );

  if (contexts.length > 0) {
    settledRoots.set(CONTEXTS_ROOT, [
      ...(value.roots?.[CONTEXTS_ROOT] ?? []),
      ...contexts,
    ]);
  }

  const rootsChanged =
    contexts.length > 0 ||
    roots.some(([, nodes, settled]) => settled !== nodes);

  return {
    reopenedRejections: pass.reopenedRejections,
    value:
      children === value.children && !rootsChanged
        ? null
        : {
            ...value,
            children,
            ...(rootsChanged
              ? { roots: Object.fromEntries(settledRoots) }
              : {}),
          },
  };
};
