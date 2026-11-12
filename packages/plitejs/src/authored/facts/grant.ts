import type { DocumentChange } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getRecordEntries, getValueRecords } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import type {
  ChangeClaim,
  SyncAtHead,
  SyncGrant,
} from '../../sync/server/grant';
import {
  type DecisionRequest,
  type DecisionSite,
  storedDecisionSiteOf,
} from '../decision';
import { type FormatTag, keyTips, sameValue } from '../tree/layers';
import {
  type AuthoredMember,
  isClaim,
  type MarkBase,
  readMembers,
} from '../tree/marks';
import { editingChangeOf, isEditingChange } from './editing';
import { contentRootsOf, factsOf, type ReviewFacts } from './facts';
import {
  CONTEXTS,
  incarnationOf,
  parseContext,
  parseReserve,
  parseVerdict,
  RESERVES,
  VERDICTS,
} from './records';
import {
  decideAtHead,
  decidesStructure,
  replayAt,
  replaysWithdrawal,
  type VerdictBatch,
  verdictBatchOf,
} from './replay';
import {
  type AuthoredStep,
  type AuthoredWrite,
  type AuthoredWrites,
  authoredWritesOf,
  type Carrier,
  type Claim,
  type HeadClaim,
  type SetKey,
} from './writes';

export type Refusal =
  | Readonly<{ kind: 'uncovered'; write: AuthoredWrite }>
  /** The batch drops a verdict record, as an undo or a redo does. */
  | Readonly<{ kind: 'reopens' }>
  /** Its verdict records name an Editing change, two tokens or two verdicts. */
  | Readonly<{ kind: 'unreadable' }>
  /** No request its verdict records name gives its result at its base. */
  | Readonly<{ kind: 'unreplayed' }>;

export type Cover =
  | Readonly<{
      claims: readonly ChangeClaim[];
      change?: DocumentChange;
      kind: 'covered';
      structure?: true;
    }>
  | Readonly<{ kind: 'refused'; why: Refusal }>
  | Readonly<{ kind: 'stale' }>;

type Kind = AuthoredWrite['kind'];
type OrdinaryKind = Exclude<Kind, 'verdict'>;
type WriteOf<K extends Kind> = Extract<AuthoredWrite, Readonly<{ kind: K }>>;

type Judge = Readonly<{
  grant: SyncGrant;
  head: ReviewFacts;
  headCutHalves: () => ReadonlySet<string>;
  writes: AuthoredWrites;
}>;

type Check<K extends OrdinaryKind> = (
  write: WriteOf<K>,
  judge: Judge
) => boolean;

type Rule<K extends OrdinaryKind> = Readonly<{
  editing: Check<K>;
  own: Check<K>;
}>;

const isOwn = (claim: MarkBase, { grant }: Judge) =>
  claim.author === grant.actor &&
  (!isEditingChange(claim.change) ||
    claim.change === editingChangeOf(grant.actor));

const isOwnPending = (claim: MarkBase, judge: Judge) =>
  isOwn(claim, judge) &&
  !isEditingChange(claim.change) &&
  !judge.head.hasVerdict(incarnationOf(claim));

const isForeignDeletion = (claim: Claim, judge: Judge) =>
  claim.kind === 'delete' && !isOwn(claim, judge);

const underNoForeignDeletion = (under: readonly Claim[], judge: Judge) =>
  !under.some((claim) => isForeignDeletion(claim, judge));

const underOwnInsertion = (under: readonly Claim[], judge: Judge) =>
  under.some((claim) => claim.kind === 'insert' && isOwnPending(claim, judge));

const underOwnStructure = (
  { carrier, under }: Readonly<{ carrier: Carrier; under: readonly Claim[] }>,
  judge: Judge
) =>
  under.some(
    (claim) =>
      (claim.kind === 'insert' ||
        (carrier.node === 'element' &&
          (claim.kind === 'wrap' || claim.kind === 'split'))) &&
      isOwnPending(claim, judge)
  );

const formatsOn = (claims: readonly Claim[], key: string) =>
  claims.filter(
    (claim): claim is FormatTag => claim.kind === 'format' && claim.key === key
  );

const endsAtOwnTopWrite = (
  { after, key }: SetKey,
  under: readonly Claim[],
  judge: Judge
) => {
  const tags = formatsOn(under, key);
  const tips = new Set(keyTips(tags));

  return tags.some(
    (tag) =>
      tips.has(tag.id) &&
      isOwnPending(tag, judge) &&
      sameValue(tag.write.kind === 'set' ? tag.write.value : undefined, after)
  );
};

const isForeignPendingFormat = (claim: Claim, key: string, judge: Judge) =>
  claim.kind === 'format' &&
  claim.key === key &&
  !isOwn(claim, judge) &&
  !isEditingChange(claim.change) &&
  !judge.head.hasVerdict(incarnationOf(claim));

const stacksOrReleasesOwnEditingTag = (
  { key }: SetKey,
  {
    added,
    under,
    was,
  }: Readonly<{
    added: readonly Claim[];
    under: readonly Claim[];
    was: readonly HeadClaim[];
  }>,
  judge: Judge
) =>
  !under.some((claim) => isForeignPendingFormat(claim, key, judge)) ||
  [
    ...added,
    ...was.flatMap(({ claim, released }) => (released ? [claim] : [])),
  ].some(
    (tag) =>
      tag.kind === 'format' &&
      tag.key === key &&
      isOwn(tag, judge) &&
      tag.change === editingChangeOf(judge.grant.actor)
  );

const WITHDRAWAL_KEEPS: ReadonlySet<Claim['kind']> = new Set([
  'delete',
  'held',
  'join',
  'unwrap',
]);

const takes = ({ taker }: WriteOf<'removed'>, carrier: Carrier) =>
  !!taker &&
  taker.root === carrier.root &&
  taker.at === carrier.at &&
  taker.node === carrier.node;

const cutHalfKeyOf = (half: MarkBase, cut: string, side: 'end' | 'start') =>
  JSON.stringify([half.author, incarnationOf(half), cut, side]);

const halfKeyOf = (claim: Claim) =>
  claim.kind === 'split' && claim.cut !== undefined
    ? cutHalfKeyOf(claim, claim.cut, claim.side)
    : null;

const joinsOtherHalfOfCut = (
  { carrier, claim }: Readonly<{ carrier: Carrier; claim: Claim }>,
  { headCutHalves, writes }: Judge
) => {
  if (claim.kind !== 'split' || claim.cut === undefined) return false;

  const { cut } = claim;
  const other = cutHalfKeyOf(
    claim,
    cut,
    claim.side === 'end' ? 'start' : 'end'
  );

  return (
    writes.writes.filter(
      (write) =>
        write.kind === 'released' &&
        write.claim.kind === 'split' &&
        write.claim.cut === cut
    ).length === 1 &&
    (writes.writes.some(
      (write) =>
        write.kind === 'removed' &&
        write.under.some((half) => halfKeyOf(half) === other) &&
        takes(write, carrier)
    ) ||
      !headCutHalves().has(other))
  );
};

const isOwnEditingReserve = (base: MarkBase, judge: Judge) =>
  isOwn(base, judge) && base.change === editingChangeOf(judge.grant.actor);

const reserveStands = ({
  batchPutsSlotAgain,
  op,
  stands,
}: WriteOf<'reserve'>) =>
  op === 'put' ? stands : !stands || batchPutsSlotAgain;

const NEVER = () => false;

const RULES: { [K in OrdinaryKind]: Rule<K> } = {
  born: {
    editing: ({ unheld }, judge) =>
      unheld.every((claim) => isOwn(claim, judge)),
    own: (write, judge) =>
      underOwnStructure(write, judge) &&
      write.unheld.every((claim) => isOwn(claim, judge)),
  },
  claimed: {
    editing: ({ claim, was }, judge) =>
      isOwn(claim, judge) && underNoForeignDeletion(was, judge),
    own: ({ claim, was }, judge) =>
      isOwnPending(claim, judge) &&
      (claim.kind !== 'insert' || underOwnInsertion(was, judge)),
  },
  context: {
    editing: NEVER,
    own: (write, judge) =>
      write.op === 'put' &&
      (write.carried ||
        (write.minted && isOwn(write.record.member, judge)) ||
        judge.head.hasVerdict(incarnationOf(write.record.member))),
  },
  landed: {
    editing: (write, { grant }) =>
      (write.op === 'put' ? write.record : write.was)?.member.change ===
      editingChangeOf(grant.actor),
    own: NEVER,
  },
  minted: {
    editing: ({ claim }, judge) =>
      isOwn(claim, judge) &&
      claim.change === editingChangeOf(judge.grant.actor),
    own: ({ claim }, judge) => isOwnPending(claim, judge),
  },
  released: {
    editing: NEVER,
    own: (write, judge) =>
      'value' in write
        ? isEditingChange(write.claim.change) &&
          isOwn(write.claim, judge) &&
          sameValue(write.claim.before, write.value.after)
        : isOwn(write.claim, judge) &&
          (WITHDRAWAL_KEEPS.has(write.claim.kind) ||
            joinsOtherHalfOfCut(write, judge)),
  },
  removed: {
    editing: ({ under }, judge) => underNoForeignDeletion(under, judge),
    own: underOwnStructure,
  },
  reserve: {
    editing: (write, judge) =>
      write.op === 'put' &&
      isOwnEditingReserve(write.base, judge) &&
      reserveStands(write),
    own: (write, judge) =>
      (write.op === 'drop' || isOwnPending(write.base, judge)) &&
      reserveStands(write),
  },
  set: {
    editing: (write, judge) =>
      underNoForeignDeletion(write.under, judge) &&
      write.keys.every((key) =>
        stacksOrReleasesOwnEditingTag(key, write, judge)
      ),
    own: ({ keys, under }, judge) =>
      keys.every((key) => endsAtOwnTopWrite(key, under, judge)),
  },
};

const isCovered = <K extends OrdinaryKind>(
  kind: K,
  write: WriteOf<K>,
  judge: Judge
) => {
  const rule = RULES[kind];

  return (
    rule.own(write, judge) ||
    (judge.grant.access === 'edit' && rule.editing(write, judge))
  );
};

const putBaseOf = (write: AuthoredWrite) => {
  if (write.kind === 'minted') return write.claim;
  if (write.kind === 'reserve' && write.op === 'put') return write.base;
  if (write.kind === 'context' && write.op === 'put') {
    return write.record.member;
  }

  return null;
};

const namesItsAuthor = ({ author, change }: MarkBase) =>
  !isEditingChange(change) || change === editingChangeOf(author);

const firstUncovered = (writes: AuthoredWrites, judge: Judge) =>
  writes.writes.find((write) => {
    const base = putBaseOf(write);

    return (
      (base && !namesItsAuthor(base)) ||
      write.kind === 'verdict' ||
      !isCovered(write.kind, write, judge)
    );
  });

const changeClaimsOf = (bases: readonly MarkBase[]) => {
  const claims = new Map<string, ChangeClaim>();

  for (const { author, change } of bases) {
    if (!isEditingChange(change)) {
      claims.set(JSON.stringify([author, change]), { author, change });
    }
  }

  return [...claims.values()];
};

const membersWithin = (node: unknown): readonly AuthoredMember[] => {
  const { children } = node as { children?: unknown };

  return [
    ...readMembers(node),
    ...(Array.isArray(children) ? children.flatMap(membersWithin) : []),
  ];
};

const contentMembersOf = (document: JsonEditorValue) =>
  [...contentRootsOf(document).values()].flatMap((nodes) =>
    nodes.slice().flatMap(membersWithin)
  );

const cutHalvesIn = (document: JsonEditorValue) =>
  new Set(
    contentMembersOf(document).flatMap((member) => {
      const key = isClaim(member) ? halfKeyOf(member) : null;

      return key === null ? [] : [key];
    })
  );

export const changeClaimsIn = (
  document: JsonEditorValue
): readonly ChangeClaim[] => {
  const store = getValueRecords(document);

  return changeClaimsOf([
    ...contentMembersOf(document).flatMap((member) =>
      'author' in member ? [member] : []
    ),
    ...[...getRecordEntries(store, CONTEXTS)].flatMap(
      ([ctx, json]) => parseContext(ctx, json)?.member ?? []
    ),
    ...[...getRecordEntries(store, RESERVES)].flatMap(
      ([id, json]) => parseReserve(id, json) ?? []
    ),
  ]);
};

export const decidedChangesIn = (
  document: JsonEditorValue
): readonly string[] => [
  ...new Set(
    [...getRecordEntries(getValueRecords(document), VERDICTS)].flatMap(
      ([id, json]) => {
        const change = parseVerdict(id, json)?.member.change;

        return change === undefined || isEditingChange(change) ? [] : [change];
      }
    )
  ),
];

// Rejecting an own change that still holds a claim in the result would
// delete its other letters too, so a withdrawal rejects only the ones the
// batch removes whole.
const ownChangesRemovedBy = (
  { after, before }: AuthoredStep,
  { actor }: SyncGrant
) => {
  const kept = new Set(changeClaimsIn(after).map(({ change }) => change));

  return [
    ...new Set(
      changeClaimsIn(before).flatMap(({ author, change }) =>
        author === actor && !kept.has(change) ? [change] : []
      )
    ),
  ];
};

const requestsOf = (
  { actions, token }: VerdictBatch,
  grant: SyncGrant,
  step: AuthoredStep,
  { book }: DecisionSite
): readonly DecisionRequest[] => {
  const mint = () => token;
  const withdraws = [...actions].every(([change, verdict]) => {
    const list = book.occurrences(change);

    return (
      verdict === 'reject' &&
      list.length > 0 &&
      list.every(({ mark }) => mark.author === grant.actor)
    );
  });

  return [
    ...(grant.decide ? [{ actions, token: mint, withdraws: false }] : []),
    ...(withdraws
      ? [
          {
            actions: new Map([
              ...actions,
              ...ownChangesRemovedBy(step, grant).map(
                (change) => [change, 'reject'] as const
              ),
            ]),
            token: mint,
            withdraws: true,
          },
        ]
      : []),
  ];
};

const decisionCover = (
  step: AuthoredStep,
  batch: VerdictBatch,
  grant: SyncGrant,
  schema: CompiledEditorSchema,
  head: JsonEditorValue | undefined
): Cover => {
  const site = storedDecisionSiteOf(schema, step.before);
  const replay = replayAt(step, requestsOf(batch, grant, step, site), site);

  if (!replay) return { kind: 'refused', why: { kind: 'unreplayed' } };

  const decided =
    head === undefined ? replay.decided : decideAtHead(replay, head, schema);

  if (!decided) return { kind: 'stale' };

  return {
    claims: [],
    change: decided.change,
    kind: 'covered',
    ...(decidesStructure(replay) ? { structure: true as const } : {}),
  };
};

const ordinaryCover = (
  step: AuthoredStep,
  grant: SyncGrant,
  schema: CompiledEditorSchema
): Cover => {
  const writes = authoredWritesOf(step);
  const claims = changeClaimsOf(writes.claims);
  let headCutHalves: ReadonlySet<string> | undefined;
  const uncovered = firstUncovered(writes, {
    grant,
    head: factsOf(step.before),
    headCutHalves: () => {
      headCutHalves ??= cutHalvesIn(step.before);

      return headCutHalves;
    },
    writes,
  });

  if (!uncovered) return { claims, kind: 'covered' };

  const withdrawn = ownChangesRemovedBy(step, grant);
  const decided =
    withdrawn.length > 0 && replaysWithdrawal(step, withdrawn, schema);

  return decided
    ? { claims, change: decided.change, kind: 'covered' }
    : { kind: 'refused', why: { kind: 'uncovered', write: uncovered } };
};

export function grantCovers(
  step: AuthoredStep,
  grant: SyncGrant,
  schema: CompiledEditorSchema
): Cover;
export function grantCovers(
  step: AuthoredStep,
  grant: SyncGrant,
  schema: CompiledEditorSchema,
  head: JsonEditorValue | undefined
): Cover | SyncAtHead;
export function grantCovers(
  step: AuthoredStep,
  grant: SyncGrant,
  schema: CompiledEditorSchema,
  head?: JsonEditorValue
): Cover | SyncAtHead {
  const batch = verdictBatchOf(step.change);

  if (batch === null) {
    return head === undefined
      ? ordinaryCover(step, grant, schema)
      : { kind: 'at-head' };
  }
  if (typeof batch === 'string') {
    return { kind: 'refused', why: { kind: batch } };
  }

  return decisionCover(step, batch, grant, schema, head);
}
