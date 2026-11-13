import {
  type DocumentChange,
  getInternalDocumentChangeRecords,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getValueRecords, recordStoreToJson } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import {
  changeOf,
  isStructureMark,
  type Occurrence,
  revisionReadOf,
} from '../changes';
import {
  type Decided,
  type DecisionRequest,
  type DecisionSite,
  decide,
  storedDecisionSiteOf,
} from '../decision';
import { isEditingChange } from './editing';
import { incarnationOf, parseVerdict, type Verdict, VERDICTS } from './records';
import type { AuthoredStep } from './writes';

export type VerdictBatch = Readonly<{
  actions: ReadonlyMap<string, Verdict>;
  token: string;
}>;

export type VerdictDrops = Readonly<{ drops: readonly [string, ...string[]] }>;

type DecidedValue = Extract<Decided, Readonly<{ status: 'decided' }>>;

export type Replay = Readonly<{
  decided: DecidedValue;
  request: DecisionRequest;
  site: DecisionSite;
}>;

const documentOf = (value: JsonEditorValue) => ({
  children: value.children,
  records: recordStoreToJson(getValueRecords(value)),
  roots: value.roots ?? {},
});

export const sameDocument = (left: JsonEditorValue, right: JsonEditorValue) =>
  jsonEqual(documentOf(left), documentOf(right));

/**
 * `null` when the batch writes no verdict record, and the ids it drops when it
 * only drops them, as an undo does. `'unreadable'` when it both puts and drops
 * them, or names an Editing change, two tokens or two verdicts on one change.
 */
export const verdictBatchOf = (
  change: DocumentChange
): VerdictBatch | VerdictDrops | 'unreadable' | null => {
  const ops = getInternalDocumentChangeRecords(change).get(VERDICTS);

  if (!ops || ops.size === 0) return null;

  const [first, ...rest] = [...ops].flatMap(([id, json]) =>
    json === null ? [id] : []
  );

  if (first !== undefined) {
    return rest.length + 1 === ops.size
      ? { drops: [first, ...rest] }
      : 'unreadable';
  }

  const actions = new Map<string, Verdict>();
  const tokens = new Set<string>();

  for (const [id, json] of ops) {
    const record = json === null ? null : parseVerdict(id, json);
    const { change: decided } = record?.member ?? {};

    if (
      !record ||
      decided === undefined ||
      isEditingChange(decided) ||
      (actions.get(decided) ?? record.verdict) !== record.verdict
    ) {
      return 'unreadable';
    }
    actions.set(decided, record.verdict);
    tokens.add(record.decision);
  }

  const [token] = tokens;

  return tokens.size === 1 ? { actions, token } : 'unreadable';
};

const decides = (
  value: JsonEditorValue,
  request: DecisionRequest,
  site: DecisionSite
): DecidedValue | null => {
  const decided = decide(value, request, site);

  return decided.status === 'decided' ? decided : null;
};

export const replayAt = (
  { after, before }: AuthoredStep,
  requests: readonly DecisionRequest[],
  site: DecisionSite
): Replay | null => {
  for (const request of requests) {
    const decided = decides(before, request, site);

    if (decided && sameDocument(decided.value, after)) {
      return { decided, request, site };
    }
  }

  return null;
};

const incarnationsOf = (list: readonly Occurrence[]) =>
  [...new Set(list.map(({ mark }) => incarnationOf(mark)))].sort();

// The revision is a 32-bit sum, so equal revisions only start the exact
// comparison of what each one reads.
const readsAlike = (
  id: string,
  was: readonly Occurrence[],
  now: readonly Occurrence[]
) =>
  jsonEqual(incarnationsOf(was), incarnationsOf(now)) &&
  (was.length === 0 ||
    (changeOf(id, was).revision === changeOf(id, now).revision &&
      revisionReadOf(was) === revisionReadOf(now)));

export const decideAtHead = (
  { request, site }: Replay,
  head: JsonEditorValue,
  schema: CompiledEditorSchema
): DecidedValue | null => {
  const at = storedDecisionSiteOf(schema, head);

  return [...request.actions.keys()].every((id) =>
    readsAlike(id, site.book.occurrences(id), at.book.occurrences(id))
  )
    ? decides(head, request, at)
    : null;
};

export const decidesStructure = ({ request, site }: Replay) =>
  [...request.actions.keys()].some((id) =>
    site.book.occurrences(id).some(({ mark }) => isStructureMark(mark))
  );

export const replaysWithdrawal = (
  step: AuthoredStep,
  changes: readonly string[],
  schema: CompiledEditorSchema
) => {
  const replay = replayAt(
    step,
    [
      {
        actions: new Map(changes.map((change) => [change, 'reject'] as const)),
        token: () => '',
        withdraws: true,
      },
    ],
    storedDecisionSiteOf(schema, step.before)
  );

  return replay && replay.decided.verdicts.length === 0 ? replay.decided : null;
};
