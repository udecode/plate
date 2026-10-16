import { type NodeList, rootNodesOf } from '../../core/change/document-index';
import { deriveValue } from '../../core/record-store';
import { countLedgerWork } from '../ledger/work';
import {
  decideKey,
  type FormatTag,
  type LayerOutcome,
  type LayerValue,
} from '../tree/layers';
import {
  type AuthoredMark,
  type AuthoredMember,
  deletionOf,
  heldOf,
  isClaim,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import { heldByJoinsAt, heldByPendingJoins } from '../tree/resolve';
import { createDependencies, type Dependencies } from './dependencies';
import { isEditingChange } from './editing';
import { claimsOf, outcomeOf, type ReviewFacts } from './facts';
import { incarnationOf, putContexts } from './records';

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
  heldByJoin: Readonly<{ has: (node: Node) => boolean }>;
  reopenedRejections: Set<string>;
  returnsHeld: boolean;
}>;

const settleFormats = (
  node: Node,
  tags: readonly FormatTag[],
  facts: ReviewFacts
) => {
  const outcomes = new Map(tags.map((tag) => [tag, outcomeOf(facts, tag)]));
  const outcome: LayerOutcome = (tag) => {
    const result = outcomes.get(tag);

    return result === 'accept' || result === 'reject' ? result : 'keep';
  };
  const dropped = new Set<FormatTag>();
  const props: Record<string, unknown> = {};

  for (const key of new Set(tags.map((tag) => tag.key))) {
    const onKey = tags.filter((tag) => tag.key === key);

    if (onKey.every((tag) => outcome(tag) === 'keep')) continue;

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
  countLedgerWork('settledNodes');

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
  // Editing's claim that its block goes with a pending join stays until the
  // resolver lands that join.
  const follows = (member: AuthoredMember) =>
    member.kind === 'insert' &&
    isEditingChange(member.change) &&
    member.follows !== undefined;
  // An accepted insertion leaves the node, whether it is a claim or a member
  // of the context the node rests on.
  const inserts = claimsOf(node, facts).filter(
    (mark) => mark.kind === 'insert' && !follows(mark)
  );
  const pendingInserts = inserts.filter(
    (mark) => outcomeOf(facts, mark) !== 'accept'
  );
  const insertsSettled = pendingInserts.length < inserts.length;

  for (const member of members) {
    if (member.kind === 'format' && dropped.has(member)) continue;
    if (follows(member)) {
      kept.push(member);
      continue;
    }
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
      if (isEditingChange(claim.change) && pass.heldByJoin.has(node)) {
        kept.push(claim);
        continue;
      }
      if (outcome === 'accept' && isText) return null;
      if (outcome === 'reject') {
        kept.push(member.kind === 'held' ? member : heldOf(claim));
        if (member.kind !== 'held') changed = true;
        continue;
      }
      if (facts.hasVerdict(incarnationOf(claim), 'reject')) {
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

const settleNodes = <L extends NodeList<Node>>(
  nodes: L,
  pass: Pass
): L | Node[] => {
  let changed = false;
  let holdsText = false;
  const next: Node[] = [];

  nodes.forEach((node) => {
    holdsText ||= typeof node.text === 'string';

    const settled = settleNode(node, pass);

    if (!settled) {
      changed = true;

      return;
    }

    const children = settled.children && settleNodes(settled.children, pass);
    const result =
      children && children !== settled.children
        ? { ...settled, children }
        : settled;

    if (result !== node) changed = true;
    next.push(result);
  });

  if (!changed) return nodes;
  if (next.length === 0 && holdsText) return [{ text: '' }];

  return next;
};

const settleBlocks = (
  children: NodeList<Node>,
  pass: Pass,
  blocks: ReadonlySet<number> | undefined
) => {
  if (!blocks) return children;

  let next: Node[] | null = null;

  for (const index of blocks) {
    const block = children.at(index);

    if (!block) continue;

    const settled = settleNodes([block], pass)[0];

    if (settled !== block) {
      next ??= children.slice();
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
    heldByJoin: new Set<Node>(),
    reopenedRejections: new Set(),
    returnsHeld,
  };
  const decisionOf = (mark: AuthoredMark) => {
    const outcome = outcomeOf(facts, mark);

    return outcome === 'pending' ? 'keep' : outcome;
  };

  if (!facts.hasVerdicts) {
    return { reopenedRejections: pass.reopenedRejections, value: null };
  }

  const settleIn = (root: string, nodes: NodeList<Node>) => {
    if (scope === 'document') {
      return settleNodes(nodes, {
        ...pass,
        heldByJoin: heldByPendingJoins(nodes, readAuthoredMarks, decisionOf),
      });
    }

    const blocks = scope.get(root);
    const held = [...(blocks ?? [])].map((index) =>
      heldByJoinsAt(nodes, index, readAuthoredMarks, decisionOf)
    );

    return settleBlocks(
      nodes,
      {
        ...pass,
        heldByJoin: { has: (node) => held.some((set) => set.has(node)) },
      },
      blocks
    );
  };
  const main = rootNodesOf(
    value as Readonly<{ children: readonly Node[] }>,
    'children'
  );
  const children = settleIn('main', main);
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, nodes]) =>
      [root, nodes, settleIn(root, nodes as readonly Node[])] as const
  );
  const minted = pass.dependencies.minted();
  const rootsChanged = roots.some(([, nodes, settled]) => settled !== nodes);

  return {
    reopenedRejections: pass.reopenedRejections,
    value:
      children === main && !rootsChanged && minted.length === 0
        ? null
        : deriveValue(
            value,
            {
              ...(children === main ? {} : { children }),
              ...(rootsChanged
                ? {
                    roots: Object.fromEntries(
                      roots.map(([root, , settled]) => [root, settled])
                    ),
                  }
                : {}),
            } as Partial<V>,
            putContexts(minted)
          ),
  };
};
