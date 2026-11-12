import {
  type DocumentChange,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import type { DocumentIndex } from '../../core/change/document-index';
import { keptRunsOf, type RootChange } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import { getRecord, getValueRecords } from '../../core/record-store';
import type { Path } from '../../interfaces/path';
import { contentRootsOf } from '../ledger/roots';
import type { FormatTag, LayerValue } from '../tree/layers';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  type AuthoredMember,
  AuthoredMarkError,
  type HeldDeletion,
  type MarkBase,
  parseMember,
  readMembers,
  type ReserveMember,
} from '../tree/marks';
import { claimsOf, factsOf, type ReviewFacts } from './facts';
import {
  CONTEXTS,
  type ContextRecord,
  incarnationOf,
  LANDED,
  type LandedRecord,
  memberOf,
  parseContext,
  parseLanded,
  parseReserve,
  parseVerdict,
  RESERVES,
  VERDICTS,
  type VerdictRecord,
} from './records';

export type AuthoredStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
}>;

export type Claim = AuthoredMark | HeldDeletion;

const withoutDeletions = (claims: ReadonlyMap<string, Claim>) =>
  new Map([...claims].filter(([, claim]) => claim.kind !== 'delete'));

export type Carrier = Readonly<{
  at: number;
  node: 'element' | 'text';
  root: string;
}>;

export type SetKey = Readonly<{
  after: LayerValue;
  before: LayerValue;
  key: string;
}>;

export type ReserveSite =
  | Readonly<{ kind: 'element'; path: Path; root: string }>
  | Readonly<{ kind: 'root'; root: string }>;

export type HeadClaim = Readonly<{ claim: Claim; released: boolean }>;

type RecordWrite<K extends string, T> =
  | Readonly<{ kind: K; op: 'drop'; was: T | null }>
  | Readonly<{ kind: K; op: 'put'; record: T }>;

export type AuthoredWrite =
  | Readonly<{ claim: Claim; kind: 'minted' }>
  | Readonly<{
      carrier: Carrier;
      kind: 'born';
      under: readonly Claim[];
      unheld: readonly Claim[];
    }>
  | Readonly<{
      carrier: Carrier;
      kind: 'removed';
      taker: Carrier | null;
      under: readonly Claim[];
    }>
  | Readonly<{
      carrier: Carrier;
      claim: Claim;
      kind: 'claimed';
      was: readonly Claim[];
    }>
  | Readonly<{
      carrier: Carrier;
      claim: Exclude<Claim, FormatTag>;
      kind: 'released';
    }>
  | Readonly<{
      carrier: Carrier;
      claim: FormatTag;
      kind: 'released';
      value: SetKey;
      was: readonly HeadClaim[];
    }>
  | Readonly<{
      added: readonly Claim[];
      carrier: Carrier;
      keys: readonly SetKey[];
      kind: 'set';
      under: readonly Claim[];
      was: readonly HeadClaim[];
    }>
  | Readonly<{
      base: MarkBase;
      batchPutsSlotAgain: boolean;
      kind: 'reserve';
      op: 'drop' | 'put';
      site: ReserveSite;
      stands: boolean;
    }>
  | (RecordWrite<'context', ContextRecord> &
      Readonly<{
        carried: boolean;
        minted: boolean;
      }>)
  | RecordWrite<'landed', LandedRecord>
  | RecordWrite<'verdict', VerdictRecord>;

export type AuthoredWrites = Readonly<{
  claims: readonly MarkBase[];
  writes: readonly AuthoredWrite[];
}>;

type Interval = readonly [number, number];

type Side = Readonly<{
  facts: ReviewFacts;
  governing: Map<string, ReadonlyMap<string, Claim>>;
  index: DocumentIndex;
}>;

type Voucher = Readonly<{
  claims: readonly string[];
  struckBy: string | null;
}>;

export const claimKeyOf = (claim: Claim) => canonicalJsonKey(claim);

const moveKeyOf = (claim: Claim) =>
  JSON.stringify([claim.author, incarnationOf(claim)]);

const isOuter = (claim: Claim) =>
  claim.kind === 'insert' || claim.kind === 'delete';

const membersIn = (node: unknown): readonly AuthoredMember[] => {
  if (
    typeof node === 'object' &&
    node !== null &&
    Object.hasOwn(node, AUTHORED_MARKS_KEY) &&
    !Array.isArray((node as Record<string, unknown>)[AUTHORED_MARKS_KEY])
  ) {
    throw new AuthoredMarkError('Review marks must be a list.', []);
  }

  return readMembers(node);
};

const parsedMembersOf = (node: unknown) => {
  const members = membersIn(node);

  for (const member of members) {
    if (!parseMember(member)) {
      throw new AuthoredMarkError('A review mark is malformed.', []);
    }
  }

  return members;
};

const ownClaimsOf = (node: unknown, facts: ReviewFacts): readonly Claim[] => {
  const held = membersIn(node).filter(
    (member): member is HeldDeletion => member.kind === 'held'
  );

  return held.length === 0
    ? claimsOf(node, facts)
    : [...claimsOf(node, facts), ...held];
};

const governingOf = (side: Side, path: readonly number[]) => {
  const key = path.join(',');
  let claims = side.governing.get(key);

  if (!claims) {
    const found = new Map<string, Claim>();

    for (let depth = 1; depth < path.length; depth++) {
      for (const claim of claimsOf(
        side.index.node(path.slice(0, depth)),
        side.facts
      )) {
        if (isOuter(claim)) found.set(claimKeyOf(claim), claim);
      }
    }
    for (const claim of ownClaimsOf(side.index.node(path), side.facts)) {
      found.set(claimKeyOf(claim), claim);
    }
    claims = found;
    side.governing.set(key, claims);
  }

  return claims;
};

const minus = (whole: Interval, holes: readonly Interval[]) => {
  const left: Interval[] = [];
  let at = whole[0];

  for (const [from, to] of [...holes].sort((a, b) => a[0] - b[0])) {
    if (from > at) left.push([at, Math.min(from, whole[1])]);
    at = Math.max(at, to);
  }
  if (at < whole[1]) left.push([at, whole[1]]);

  return left.filter(([from, to]) => from < to);
};

const overlaps = (intervals: readonly Interval[], from: number, to: number) =>
  intervals.some(([start, end]) => start < to && from < end);

const holds = (intervals: readonly Interval[], position: number) =>
  overlaps(intervals, position, position + 1);

const lettersIn = (
  node: unknown,
  from: number,
  intervals: readonly Interval[]
) => {
  const text = (node as { text?: string }).text ?? '';

  return intervals
    .map(([start, end]) =>
      text.slice(Math.max(0, start - from - 1), Math.max(0, end - from - 1))
    )
    .join('');
};

const propsOf = (node: unknown) => {
  const {
    [AUTHORED_MARKS_KEY]: _members,
    children: _children,
    text: _text,
    ...props
  } = node as Record<string, unknown>;
  const shown = membersIn(node).find((member) => member.kind === 'as');

  return shown ? { ...props, [`${AUTHORED_MARKS_KEY}:as`]: shown } : props;
};

const changedKeys = (before: unknown, after: unknown): readonly SetKey[] => {
  const left = propsOf(before);
  const right = propsOf(after);

  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter(
      (key) => canonicalJsonKey(left[key]) !== canonicalJsonKey(right[key])
    )
    .sort()
    .map((key) => ({
      after: right[key] as LayerValue,
      before: left[key] as LayerValue,
      key,
    }));
};

const reservesOf = (node: unknown) =>
  membersIn(node).filter(
    (member): member is ReserveMember => member.kind === 'reserve'
  );

const slotKeyOf = ({ slot }: Pick<ReserveMember, 'slot'>) =>
  'prefix' in slot ? `p${slot.prefix}` : `m${slot.min}`;

const baseOf = ({ at, author, change, inc }: MarkBase) =>
  memberOf({ at, author, change, ...(inc === undefined ? {} : { inc }) });

const holdsBase = (
  nodes: readonly unknown[],
  base: MarkBase,
  facts: ReviewFacts
) => {
  const incarnation = incarnationOf(base);

  return nodes.some((node) =>
    claimsOf(node, facts).some(
      (claim) =>
        claim.author === base.author && incarnationOf(claim) === incarnation
    )
  );
};

const childrenOf = (node: unknown): readonly unknown[] => {
  const { children } = node as { children?: unknown };

  return Array.isArray(children) ? children : [];
};

const textOf = (node: unknown): string => {
  const { text } = node as { text?: unknown };

  return typeof text === 'string'
    ? text
    : childrenOf(node).map(textOf).join('');
};

const contentKeyOf = (node: unknown) =>
  canonicalJsonKey([propsOf(node), textOf(node)]);

const nodesWithin = (node: unknown): readonly unknown[] => [
  node,
  ...childrenOf(node).flatMap(nodesWithin),
];

const typeOf = (node: unknown) => (node as { type?: unknown }).type;

const strikersOfEveryLetter = (
  node: unknown,
  facts: ReviewFacts
): readonly string[] => {
  const [first, ...rest] = nodesWithin(node)
    .filter((each) => (each as { text?: unknown }).text)
    .map(
      (text) =>
        new Set(
          claimsOf(text, facts)
            .filter((claim) => claim.kind === 'delete')
            .map(moveKeyOf)
        )
    );

  return first
    ? [...first].filter((striker) => rest.every((each) => each.has(striker)))
    : [];
};

type ParseRecord<T> = (id: string, json: string) => T | null;

const parseRecord = <T>(parse: ParseRecord<T>, id: string, json: string) => {
  const record = parse(id, json);

  if (!record) {
    throw new AuthoredMarkError(`Review record ${id} is malformed.`, []);
  }

  return record;
};

const parseStoredRecord = <T>(
  parse: ParseRecord<T>,
  id: string,
  json: string | null | undefined
) => (json == null ? null : parseRecord(parse, id, json));

const recordWritesOf = <K extends string, T>(
  kind: K,
  parse: ParseRecord<T>,
  id: string,
  json: string | null,
  stored: string | undefined
): ReadonlyArray<RecordWrite<K, T>> => {
  const was = parseStoredRecord(parse, id, stored);

  if (json === null) return [{ kind, op: 'drop', was }];

  const record = parseRecord(parse, id, json);
  const put = { kind, op: 'put', record } as const;

  return was && canonicalJsonKey(was) !== canonicalJsonKey(record)
    ? [{ kind, op: 'drop', was }, put]
    : [put];
};

const keyValueOf = (head: unknown, result: unknown, key: string): SetKey => ({
  after: propsOf(result)[key] as LayerValue,
  before: propsOf(head)[key] as LayerValue,
  key,
});

const headClaimsOf = (
  was: ReadonlyMap<string, Claim>,
  now: ReadonlyMap<string, Claim>
): readonly HeadClaim[] =>
  [...was].map(([key, claim]) => ({ claim, released: !now.has(key) }));

type Holder = Readonly<{ claims: ReadonlyMap<string, Claim>; node: unknown }>;

type Compare = (carrier: Carrier, head: Holder, result: Holder) => void;

const compareKeptChildren = (
  {
    bornElements,
    head,
    removedElements,
    result,
    root,
    rootChange,
  }: Readonly<{
    bornElements: ReadonlyArray<readonly number[]>;
    head: Side;
    removedElements: ReadonlyArray<readonly number[]>;
    result: Side;
    root: string;
    rootChange: RootChange;
  }>,
  compare: Compare
) => {
  const comparePair = (
    headPath: readonly number[] | undefined,
    resultPath: readonly number[] | undefined
  ) => {
    if (!headPath || !resultPath) return;

    const node = result.index.node(resultPath);

    compare(
      {
        at: result.index.nodeRange(resultPath).from,
        node:
          (node as { text?: unknown }).text === undefined ? 'element' : 'text',
        root,
      },
      { claims: governingOf(head, headPath), node: head.index.node(headPath) },
      { claims: governingOf(result, resultPath), node }
    );
  };
  const childPathsOf = (side: Side, path: readonly number[]) =>
    childrenOf(side.index.node(path)).map((_child, index) => [...path, index]);

  for (const path of bornElements) {
    for (const childPath of childPathsOf(result, path)) {
      const { from } = result.index.nodeRange(childPath);
      const [run] = keptRunsOf(rootChange, from, from + 1);

      if (run) comparePair(head.index.nodeStartingAt(run.at)?.path, childPath);
    }
  }
  for (const path of removedElements) {
    for (const childPath of childPathsOf(head, path)) {
      const { from } = head.index.nodeRange(childPath);
      const mapped = rootChange.mapPos(from, 1, 'after');

      if (mapped !== null) {
        comparePair(childPath, result.index.nodeStartingAt(mapped)?.path);
      }
    }
  }
};

const isSplitCopy = (claim: Claim): claim is Exclude<Claim, FormatTag> =>
  claim.kind === 'delete' || claim.kind === 'insert';

const AUTHORED_SETS: ReadonlySet<string> = new Set([
  CONTEXTS,
  LANDED,
  RESERVES,
  VERDICTS,
]);

export const authoredWritesOf = ({
  after,
  before,
  change,
}: AuthoredStep): AuthoredWrites => {
  const headStore = getValueRecords(before);
  const records = getInternalDocumentChangeRecords(change);
  const headFacts = factsOf(before);
  const resultFacts = factsOf(after);
  const headClaims = new Set<string>();
  const resultClaims = new Map<string, Claim>();
  const listedByHead = new Set<string>();
  const nodeWrites = new Map<string, AuthoredWrite>();
  const born = new Map<string, AuthoredWrite[]>();
  const removed = new Map<string, AuthoredWrite[]>();
  const reserves: AuthoredWrite[] = [];
  const recordedBases: MarkBase[] = [];
  const vouchers = new Map<string, Voucher[]>();
  const vouched = new Map<unknown, readonly string[]>();

  const vouch = (
    node: unknown,
    claims: ReadonlyMap<string, Claim>,
    struckBy: string | null
  ) => {
    const content = contentKeyOf(node);

    vouchers.set(content, [
      ...(vouchers.get(content) ?? []),
      { claims: [...claims.keys()], struckBy },
    ]);
  };
  const vouchedFor = (node: unknown, under: readonly Claim[]) => {
    let claims = vouched.get(node);

    if (!claims) {
      const offered = vouchers.get(contentKeyOf(node)) ?? [];
      const moves = new Set(
        under.flatMap((claim) =>
          claim.kind === 'insert' ? [moveKeyOf(claim)] : []
        )
      );
      const index = offered.findIndex(
        ({ struckBy }) => struckBy === null || moves.has(struckBy)
      );

      claims = index === -1 ? [] : offered.splice(index, 1)[0].claims;
      vouched.set(node, claims);
    }

    return claims;
  };

  const once = (key: string, write: AuthoredWrite) => {
    if (!nodeWrites.has(key)) nodeWrites.set(key, write);
  };
  const tally = (
    into: Map<string, AuthoredWrite[]>,
    key: string,
    write: AuthoredWrite
  ) => {
    into.set(key, [...(into.get(key) ?? []), write]);
  };
  const underKey = (claims: ReadonlyMap<string, Claim>) =>
    [...claims.keys()].sort().join('|');
  const carrierKeyOf = (
    kind: Carrier['node'],
    node: unknown,
    claims: ReadonlyMap<string, Claim>,
    letters: string
  ) =>
    `${kind} ${canonicalJsonKey(propsOf(node))} ${underKey(claims)} ${letters}`;
  const compare: Compare = (carrier, head, result) => {
    const was = head.claims;
    const now = result.claims;

    for (const [key, claim] of now) {
      if (!was.has(key)) {
        once(`claimed ${carrier.node} ${key} ${underKey(was)}`, {
          carrier,
          claim,
          kind: 'claimed',
          was: [...was.values()],
        });
        if (claim.kind === 'delete') vouch(head.node, was, moveKeyOf(claim));
      }
    }
    if (carrier.node === 'element') {
      const struck = new Set(strikersOfEveryLetter(head.node, headFacts));
      const striker = strikersOfEveryLetter(result.node, resultFacts).find(
        (each) => !struck.has(each)
      );

      if (striker) vouch(head.node, was, striker);
    }
    const ownBefore = new Set(
      ownClaimsOf(head.node, headFacts).map(claimKeyOf)
    );
    const ownAfter = new Set(
      ownClaimsOf(result.node, resultFacts).map(claimKeyOf)
    );

    for (const [key, claim] of now) {
      if (was.has(key) && ownAfter.has(key) && !ownBefore.has(key)) {
        once(`claimed own ${carrier.node} ${carrier.at} ${key}`, {
          carrier,
          claim,
          kind: 'claimed',
          was: [...was.values()],
        });
      }
    }
    for (const [key, claim] of was) {
      if (
        claim.kind !== 'format' &&
        now.has(key) &&
        ownBefore.has(key) &&
        !ownAfter.has(key)
      ) {
        once(`released own ${carrier.node} ${carrier.at} ${key}`, {
          carrier,
          claim,
          kind: 'released',
        });
      }
    }
    for (const [key, claim] of was) {
      if (now.has(key)) continue;
      if (claim.kind === 'format') {
        const value = keyValueOf(head.node, result.node, claim.key);

        once(
          `released ${carrier.node} ${key} ${canonicalJsonKey(value)} ${underKey(was)} ${underKey(now)}`,
          {
            carrier,
            claim,
            kind: 'released',
            value,
            was: headClaimsOf(was, now),
          }
        );
      } else {
        once(`released ${carrier.node} ${key}`, {
          carrier,
          claim,
          kind: 'released',
        });
      }
    }
  };
  const setKeys = (
    carrier: Carrier,
    keys: readonly SetKey[],
    was: ReadonlyMap<string, Claim>,
    now: ReadonlyMap<string, Claim>
  ) => {
    if (keys.length === 0) return;
    once(
      `set ${carrier.node} ${canonicalJsonKey(keys)} ${underKey(was)} ${underKey(now)}`,
      {
        added: [...now].flatMap(([key, claim]) =>
          was.has(key) ? [] : [claim]
        ),
        carrier,
        keys,
        kind: 'set',
        under: [...now.values()],
        was: headClaimsOf(was, now),
      }
    );
  };
  const reserveWrites = (
    op: 'drop' | 'put',
    members: readonly ReserveMember[],
    others: readonly ReserveMember[],
    site: ReserveSite,
    resultSite: unknown
  ) => {
    const otherKeys = new Set(others.map((other) => canonicalJsonKey(other)));

    for (const member of members) {
      if (otherKeys.has(canonicalJsonKey(member))) continue;

      const base = baseOf(member);

      reserves.push({
        base,
        batchPutsSlotAgain:
          op === 'drop' &&
          others.some(
            (other) =>
              slotKeyOf(other) === slotKeyOf(member) &&
              other.author === member.author &&
              incarnationOf(other) === incarnationOf(member) &&
              !members.some(
                (mine) => canonicalJsonKey(mine) === canonicalJsonKey(other)
              )
          ),
        kind: 'reserve',
        op,
        site,
        stands:
          resultSite !== undefined &&
          holdsBase([resultSite, ...childrenOf(resultSite)], base, resultFacts),
      });
    }
  };

  const heads = contentRootsOf(before);
  const results = contentRootsOf(after);

  for (const root of new Set([...heads.keys(), ...results.keys()])) {
    const headIndex = heads.get(root);
    const resultIndex = results.get(root);
    const rootChange = getInternalDocumentRootChange(change, root);
    const whole =
      !headIndex ||
      !resultIndex ||
      change.createRoots.has(root) ||
      change.deleteRoots.has(root);

    if (!whole && (!rootChange || rootChange.empty)) continue;

    const head: Side | null = headIndex
      ? { facts: headFacts, governing: new Map(), index: headIndex }
      : null;
    const result: Side | null = resultIndex
      ? { facts: resultFacts, governing: new Map(), index: resultIndex }
      : null;
    const keptRuns = (from: number, to: number) =>
      whole || !rootChange ? [] : keptRunsOf(rootChange, from, to);
    const headPathAt = (position: number) =>
      head?.index.openContextAt(position).at(-1)?.path ?? null;
    const claimsOwningToken = (position: number) =>
      !head || position < 0 || position + 1 > head.index.length
        ? []
        : head.index
            .nodeRangesTouching(position, position + 1)
            .filter(({ from, to }) => from <= position && position + 1 <= to)
            .flatMap(({ path }) => [...governingOf(head, path).keys()]);
    const heldOnBothSides = (fromA: number, toA: number) => {
      const ownersBefore = new Set(claimsOwningToken(fromA - 1));

      return claimsOwningToken(toA).filter((key) => ownersBefore.has(key));
    };
    const ranges = whole
      ? [[0, headIndex?.length ?? 0, 0, resultIndex?.length ?? 0] as const]
      : getInternalDocumentChangeRanges(change, root);
    const seenResult = new Set<number>();
    const seenHead = new Set<number>();
    const vouchedHead = new Set<number>();
    const removedHead = new Set<number>();
    const bornElements: Array<readonly number[]> = [];
    const removedElements: Array<readonly number[]> = [];
    const takerOf = (from: number, path: readonly number[]): Carrier | null => {
      if (!result || !rootChange || whole) return null;

      const inside = rootChange.mapPos(from + 1, -1);

      if (inside === null) return null;

      const container = result.index
        .openContextAt(inside)
        .findLast(
          (open) =>
            open.kind === 'element' && open.from < inside && inside < open.to
        );
      const taker =
        container && container.path.length >= path.length
          ? container
          : (result.index
              .nodeRangesTouching(Math.max(0, inside - 1), inside)
              .find(
                (entry) =>
                  entry.kind === 'element' &&
                  entry.to === inside &&
                  entry.path.length === path.length
              ) ?? container);

      return taker ? { at: taker.from, node: 'element', root } : null;
    };
    const bornHere: Array<
      Readonly<{
        carrier: Carrier;
        continued: readonly string[];
        key: string;
        node: unknown;
        range: number;
        under: readonly Claim[];
        within: Interval;
      }>
    > = [];
    const headSides = ranges.map(([fromA, toA, fromB, toB]) => {
      const runs = keptRuns(fromB, toB);
      const removedAt = minus(
        [fromA, toA],
        runs.map(({ at, from, to }) => [at, at + to - from] as const)
      );
      const lostElements: Array<
        Readonly<{ claims: readonly string[]; key: string; type: unknown }>
      > = [];

      for (const entry of head?.index.nodeRangesTouching(fromA, toA) ?? []) {
        if (!head || removedHead.has(entry.from)) continue;

        const node = head.index.node(entry.path);
        const was = governingOf(head, entry.path);

        if (!seenHead.has(entry.from)) {
          seenHead.add(entry.from);
          for (const claim of ownClaimsOf(node, headFacts)) {
            headClaims.add(claimKeyOf(claim));
          }
        }

        if (!overlaps(removedAt, entry.from, entry.to)) continue;

        const lettersGone =
          entry.kind === 'text' &&
          entry.to - entry.from > 2 &&
          overlaps(removedAt, entry.from + 1, entry.to - 1);

        if (!vouchedHead.has(entry.from)) {
          vouchedHead.add(entry.from);
          vouch(
            node,
            entry.kind === 'element' || lettersGone
              ? was
              : withoutDeletions(was),
            null
          );
        }

        const lost =
          entry.kind === 'element' ? holds(removedAt, entry.from) : lettersGone;

        if (!lost) continue;
        removedHead.add(entry.from);

        const key = carrierKeyOf(
          entry.kind,
          node,
          was,
          entry.kind === 'text' ? lettersIn(node, entry.from, removedAt) : ''
        );

        if (entry.kind === 'element') {
          removedElements.push(entry.path);
          lostElements.push({
            claims: [...was.keys()],
            key,
            type: typeOf(node),
          });
        }
        tally(removed, key, {
          carrier: { at: entry.from, node: entry.kind, root },
          kind: 'removed',
          taker:
            entry.kind === 'element' ? takerOf(entry.from, entry.path) : null,
          under: [...was.values()],
        });
      }

      return {
        around: whole ? [] : heldOnBothSides(fromA, toA),
        lostElements,
        runs,
      };
    });
    const heldByKeptSiblingBefore = (path: readonly number[]) => {
      const index = path.at(-1) ?? 0;

      if (!head || !result || index === 0) return [];

      const { from } = result.index.nodeRange([
        ...path.slice(0, -1),
        index - 1,
      ]);
      const [run] = keptRuns(from, from + 1);
      const headPath = run && head.index.nodeStartingAt(run.at)?.path;

      return headPath ? [...governingOf(head, headPath).keys()] : [];
    };
    const heldByAncestors = (path: readonly number[]) =>
      result && path.length > 1
        ? [...governingOf(result, path.slice(0, -1))].flatMap(([key, claim]) =>
            isOuter(claim) ? [key] : []
          )
        : [];

    for (const [index, range] of ranges.entries()) {
      const [fromB, toB] = range.slice(2);
      const { runs } = headSides[index];
      const bornAt = minus(
        [fromB, toB],
        runs.map(({ from, to }) => [from, to] as const)
      );

      for (const entry of result?.index.nodeRangesTouching(fromB, toB) ?? []) {
        if (!result || seenResult.has(entry.from)) continue;
        seenResult.add(entry.from);

        const node = result.index.node(entry.path);

        parsedMembersOf(node);
        for (const claim of ownClaimsOf(node, resultFacts)) {
          resultClaims.set(claimKeyOf(claim), claim);
        }
        recordedBases.push(...reservesOf(node));
        for (const member of membersIn(node)) {
          if (
            member.kind === 'in' &&
            getRecord(headStore, CONTEXTS, member.ctx) !== undefined
          ) {
            for (const claim of claimsOf(
              { [AUTHORED_MARKS_KEY]: [member] },
              resultFacts
            )) {
              listedByHead.add(claimKeyOf(claim));
            }
          }
        }

        const carrierAt = (at: number): Carrier => ({
          at,
          node: entry.kind,
          root,
        });
        const now = governingOf(result, entry.path);

        if (entry.kind === 'element') {
          if (holds(bornAt, entry.from)) {
            bornElements.push(entry.path);
            bornHere.push({
              carrier: carrierAt(entry.from),
              continued: [
                ...heldByKeptSiblingBefore(entry.path),
                ...heldByAncestors(entry.path),
              ],
              key: carrierKeyOf('element', node, now, ''),
              node,
              range: index,
              under: [...now.values()],
              within: [entry.from, entry.to],
            });
            reserveWrites(
              'put',
              reservesOf(node),
              [],
              { kind: 'element', path: entry.path, root },
              node
            );
            continue;
          }
          if (entry.from < fromB || entry.from >= toB || !head) continue;

          const [run] = keptRuns(entry.from, entry.from + 1);
          const headPath = run && head.index.nodeStartingAt(run.at)?.path;

          if (!headPath) continue;

          const was = head.index.node(headPath);
          const claims = governingOf(head, headPath);

          compare(
            carrierAt(entry.from),
            { claims, node: was },
            { claims: now, node }
          );
          setKeys(carrierAt(entry.from), changedKeys(was, node), claims, now);
          reserveWrites(
            'put',
            reservesOf(node),
            reservesOf(was),
            { kind: 'element', path: entry.path, root },
            node
          );
          reserveWrites(
            'drop',
            reservesOf(was),
            reservesOf(node),
            { kind: 'element', path: headPath, root },
            node
          );
          continue;
        }

        const content: Interval = [entry.from + 1, entry.to - 1];
        const letters = keptRuns(content[0], content[1]);
        const fresh = minus(
          content,
          letters.map(({ from, to }) => [from, to] as const)
        );

        if (fresh.length > 0) {
          bornHere.push({
            carrier: carrierAt(fresh[0][0]),
            continued: heldByAncestors(entry.path),
            key: carrierKeyOf(
              'text',
              node,
              now,
              lettersIn(node, entry.from, fresh)
            ),
            node,
            range: index,
            under: [...now.values()],
            within: [entry.from, entry.to],
          });
        }
        for (const run of head ? letters : []) {
          const headPath = headPathAt(run.at);

          if (!head || !headPath) continue;

          const claims = governingOf(head, headPath);
          const was = head.index.node(headPath);

          compare(
            carrierAt(run.from),
            { claims, node: was },
            { claims: now, node }
          );
          setKeys(carrierAt(run.from), changedKeys(was, node), claims, now);
        }
      }
    }

    if (!whole && rootChange && head && result) {
      compareKeptChildren(
        {
          bornElements,
          head,
          removedElements,
          result,
          root,
          rootChange,
        },
        compare
      );
    }

    const releaseUncopiedLineClaims = ({
      carrier,
      node,
      within,
    }: (typeof bornHere)[number]) => {
      if (!head) return;

      const own = new Set(ownClaimsOf(node, resultFacts).map(claimKeyOf));

      for (const run of keptRuns(...within)) {
        for (const kept of head.index.nodeRangesTouching(
          run.at,
          run.at + run.to - run.from - 1
        )) {
          const line =
            kept.kind === 'text'
              ? head.index.node(kept.path.slice(0, -1))
              : null;

          if (!line || typeOf(line) !== typeOf(node)) continue;
          for (const claim of ownClaimsOf(line, headFacts)) {
            const key = claimKeyOf(claim);

            if (own.has(key) || !isSplitCopy(claim)) continue;
            once(`released from ${carrier.at} ${key}`, {
              carrier,
              claim,
              kind: 'released',
            });
          }
        }
      }
    };
    const bornKeys = new Set(bornHere.map(({ key }) => key));

    for (const each of bornHere) {
      const { around, lostElements } = headSides[each.range];
      const within = nodesWithin(each.node);
      const types = new Set(within.map(typeOf));
      const held = new Set([
        ...around,
        ...each.continued,
        ...(each.carrier.node === 'element'
          ? lostElements.flatMap((lost) =>
              types.has(lost.type) && !bornKeys.has(lost.key) ? lost.claims : []
            )
          : []),
        ...within.flatMap((node) => vouchedFor(node, each.under)),
        ...(head
          ? keptRuns(...each.within).flatMap((run) => {
              const keptTo = run.at + run.to - run.from;

              return head.index
                .nodeRangesTouching(run.at, keptTo - 1)
                .flatMap((kept) => {
                  const keepsNoLetter =
                    kept.kind === 'text' &&
                    !overlaps([[run.at, keptTo]], kept.from + 1, kept.to - 1);

                  return [...governingOf(head, kept.path)].flatMap(
                    ([key, claim]) =>
                      keepsNoLetter && claim.kind === 'delete' ? [] : [key]
                  );
                });
            })
          : []),
      ]);

      if (each.carrier.node === 'element') releaseUncopiedLineClaims(each);
      tally(born, each.key, {
        carrier: each.carrier,
        kind: 'born',
        under: each.under,
        unheld: ownClaimsOf(each.node, resultFacts).filter(
          (claim) => !held.has(claimKeyOf(claim))
        ),
      });
    }
  }

  const spares = [...(records.get(RESERVES) ?? [])].flatMap(([id, json]) =>
    recordWritesOf(
      'reserve',
      parseReserve,
      id,
      json,
      getRecord(headStore, RESERVES, id)
    )
  );

  for (const spare of spares) {
    if (spare.op === 'put') recordedBases.push(spare.record);

    const shape = spare.op === 'put' ? spare.record : spare.was;

    if (!shape) continue;

    const nodes = results.get(shape.root)?.nodes;

    reserves.push({
      base: baseOf(shape),
      batchPutsSlotAgain:
        spare.op === 'drop' &&
        spares.some(
          (other) =>
            other.op === 'put' &&
            other.record.root === shape.root &&
            other.record.author === shape.author &&
            slotKeyOf(other.record) === slotKeyOf(shape) &&
            incarnationOf(other.record) === incarnationOf(shape)
        ),
      kind: 'reserve',
      op: spare.op,
      site: { kind: 'root', root: shape.root },
      stands: !!nodes && holdsBase(nodes.slice(), shape, resultFacts),
    });
  }

  const minted: AuthoredWrite[] = [];
  const mintedKeys = new Set<string>();

  for (const [key, claim] of resultClaims) {
    if (!headClaims.has(key) && !listedByHead.has(key)) {
      minted.push({ claim, kind: 'minted' });
      mintedKeys.add(key);
    }
  }

  const verdicts: AuthoredWrite[] = [];
  const landed: AuthoredWrite[] = [];
  const contexts: AuthoredWrite[] = [];

  for (const [set, ops] of records) {
    if (!AUTHORED_SETS.has(set)) {
      if (set.startsWith('authored-')) {
        throw new AuthoredMarkError(`Review record set ${set} is unknown.`, []);
      }
      continue;
    }
    for (const [id, json] of ops) {
      const stored = getRecord(headStore, set, id);

      if (set === VERDICTS) {
        verdicts.push(
          ...recordWritesOf('verdict', parseVerdict, id, json, stored)
        );
      } else if (set === LANDED) {
        landed.push(...recordWritesOf('landed', parseLanded, id, json, stored));
      } else if (set === CONTEXTS) {
        for (const write of recordWritesOf(
          'context',
          parseContext,
          id,
          json,
          stored
        )) {
          const member = (write.op === 'put' ? write.record : write.was)
            ?.member;
          const claim = member && claimKeyOf({ ...member, kind: 'insert' });

          if (write.op === 'put') recordedBases.push(write.record.member);
          contexts.push({
            ...write,
            carried:
              !!claim && (headClaims.has(claim) || listedByHead.has(claim)),
            minted: !!claim && mintedKeys.has(claim),
          });
        }
      }
    }
  }

  const exceptMoved = (
    mine: ReadonlyMap<string, readonly AuthoredWrite[]>,
    theirs: ReadonlyMap<string, readonly AuthoredWrite[]>
  ) =>
    [...mine].flatMap(([key, writes]) =>
      writes.slice(theirs.get(key)?.length ?? 0)
    );

  return {
    claims: [...resultClaims.values(), ...recordedBases],
    writes: [
      ...minted,
      ...verdicts,
      ...landed,
      ...contexts,
      ...reserves,
      ...exceptMoved(removed, born),
      ...exceptMoved(born, removed),
      ...nodeWrites.values(),
    ],
  };
};
