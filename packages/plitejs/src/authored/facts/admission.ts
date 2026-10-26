import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import {
  type DocumentIndex,
  type IndexedNodeRange,
  NO_NODES,
  type SparseNodes,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  type KeptRun,
  keptRunsOf,
  propertyDeltaFromModifications,
  RootChange,
  type RootChangeSection,
  semanticPropertyModifications,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import type { DocumentAdmission } from '../../core/document-admission';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { EditorMissingReferenceError } from '../../core/missing-reference';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { getActiveEditorUpdateTags } from '../../core/public-state';
import { getValueRecords, recordOpsBetween } from '../../core/record-store';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { getReviewLedger } from '../ledger/ledger';
import { rootOf } from '../ledger/roots';
import {
  authoredResolveSchemaOf,
  storedResolveSchemaOf,
} from '../resolve-schema';
import { relinkCuts } from '../tree/cuts';
import type { KeyReading } from '../tree/layers';
import {
  AuthoredMarkError,
  createAuthoredMarksValidator,
  isAuthoredSetValued,
} from '../tree/marks';
import { compactClaims, type TopLevelIndicesByRoot } from './compact';
import {
  addCounts,
  assertRecordStore,
  assertRecordWrites,
  contentRootsOf,
  factsOf,
  insertionsIn,
  insertionsOf,
  rememberInsertions,
} from './facts';
import { CONTEXTS, VERDICTS, verdictIncarnationsOf } from './records';
import { keyReadingOf, repairKeys, settleValue } from './settle';

const changedChildren = (
  change: DocumentChange,
  root: string,
  before: JsonEditorValue,
  after: DocumentIndex
): ReadonlyArray<readonly [number, number, number, number]> => {
  if (change.createRoots.has(root) || change.deleteRoots.has(root)) {
    return [
      [
        0,
        change.createRoots.has(root) ? 0 : rootOf(before, root).size,
        0,
        after.size,
      ],
    ];
  }

  return rootOf(before, root).changedChildren(after);
};

/**
 * The children of `after` that admission settles: each replaced child and
 * one more on each side, which covers a change at a boundary.
 */
const childrenAround = (
  ranges: ReadonlyArray<readonly [number, number, number, number]>,
  length: number
) => {
  const at = new Set<number>();

  for (const { 2: from, 3: to } of ranges) {
    for (
      let child = Math.max(0, from - 1);
      child < Math.min(length, to + 1);
      child += 1
    ) {
      at.add(child);
    }
  }

  return [...at].sort((left, right) => left - right);
};

type Leaf = Readonly<Record<string, unknown>> & { text?: string };

type Part = Readonly<{ node: Leaf; run: KeptRun }>;

const propsOf = ({ text: _text, ...props }: Leaf) => props;

const splitLeaf = (
  node: Leaf,
  contentFrom: number,
  parts: readonly Part[]
): readonly Leaf[] => {
  const text = node.text ?? '';
  const leaves: Leaf[] = [];
  const push = (
    props: Readonly<Record<string, unknown>>,
    start: number,
    end: number
  ) => {
    if (end <= start) return;
    const last = leaves.at(-1);

    if (last && jsonEqual(propsOf(last), props)) {
      leaves[leaves.length - 1] = {
        ...props,
        text: last.text + text.slice(start, end),
      };
    } else leaves.push({ ...props, text: text.slice(start, end) });
  };
  let offset = 0;

  for (const part of parts) {
    const start = part.run.from - contentFrom;

    push(propsOf(node), offset, start);
    push(propsOf(part.node), start, part.run.to - contentFrom);
    offset = part.run.to - contentFrom;
  }
  push(propsOf(node), offset, text.length);

  return leaves;
};

const formatTokensOf = (entry: IndexedNodeRange) =>
  entry.kind === 'text' && entry.contentFrom < entry.contentTo
    ? { from: entry.contentFrom, to: entry.contentTo }
    : { from: entry.from, to: entry.from + 1 };

const repairRejectedTags = (
  change: RootChange,
  ranges: Iterable<readonly [number, number, number, number]>,
  before: DocumentIndex,
  after: DocumentIndex,
  reading: KeyReading
) => {
  const sections: RootChangeSection[] = [];
  const seen = new Set<number>();

  for (const [_fromBefore, _toBefore, from, to] of ranges) {
    for (const entry of after.nodeRangesTouching(from, to)) {
      if (seen.has(entry.from)) continue;
      seen.add(entry.from);

      const node = after.node(entry.path) as Leaf;
      const tokens = formatTokensOf(entry);
      const runs = keptRunsOf(change, tokens.from, tokens.to);
      const parts = runs.flatMap((run): Part[] => {
        const source = before.nodeStartingAt(run.at) ?? before.textAt(run.at);

        return source
          ? [{ run, node: repairKeys(before.node(source.path), node, reading) }]
          : [];
      });

      if (parts.every((part) => part.node === node)) continue;
      const [first] = parts;
      const covered =
        parts.reduce((sum, part) => sum + part.run.to - part.run.from, 0) ===
        tokens.to - tokens.from;

      if (
        covered &&
        parts.every((part) =>
          jsonEqual(propsOf(part.node), propsOf(getDefined(first).node))
        )
      ) {
        const props = propsOf(getDefined(first).node);
        const unset = Object.keys(propsOf(node)).filter(
          (key) => !(key in props)
        );
        const set = Object.fromEntries(
          Object.entries(props).filter(
            ([key, value]) => !jsonEqual(value, node[key])
          )
        );

        sections.push({
          from: entry.from,
          properties: {
            ...(Object.keys(set).length > 0 ? { set } : {}),
            ...(unset.length > 0 ? { unset } : {}),
          },
        });
        continue;
      }

      sections.push({
        from: entry.from,
        insert: PreparedTokenSlice.fromNodes(
          splitLeaf(node, entry.contentFrom, parts) as readonly JsonNode[]
        ),
        to: entry.to,
      });
    }
  }

  return sections.length === 0 ? null : RootChange.create(after, sections);
};

type Props = Readonly<Record<string, unknown>> & {
  children?: readonly Props[];
};

const ownProps = ({ children: _children, text: _text, ...props }: Props) =>
  props;

const compactionChange = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  blocks?: TopLevelIndicesByRoot
) => {
  const changes = new Map<string, RootChange>();

  const roots = contentRootsOf(before);

  for (const [root, nodes] of contentRootsOf(after)) {
    if (roots.get(root) === nodes) continue;

    const was = rootOf(before, root);

    const sections: RootChangeSection[] = [];
    const walk = (left: Props, right: Props, path: readonly number[]) => {
      if (left === right) return;

      const modifications = semanticPropertyModifications(
        ownProps(left),
        ownProps(right),
        (key) => isAuthoredSetValued(null, key)
      );

      if (modifications.length > 0) {
        const { from } = was.nodeRange(path);

        sections.push({
          from,
          properties: propertyDeltaFromModifications(modifications),
          to: from + 1,
        });
      }
      for (const [at, child] of (left.children ?? []).entries()) {
        walk(child, getDefined(right.children?.[at]), [...path, at]);
      }
    };

    for (const at of blocks?.get(root) ??
      Array.from({ length: nodes.length }, (_, index) => index)) {
      const left = was.child(at) as Props | undefined;

      if (left) walk(left, getDefined(nodes.at(at)), [at]);
    }
    if (sections.length > 0) {
      changes.set(root, RootChange.create(was, sections));
    }
  }

  return changes.size === 0 ? null : createInternalDocumentChange(changes);
};

const repairOf = (
  after: JsonEditorValue,
  settled: JsonEditorValue,
  steps: ReadonlyArray<DocumentChange | null>,
  indexOf: (root: string) => DocumentIndex
) => {
  const repair = [
    ...steps.filter((step) => step !== null),
    createInternalDocumentChange(new Map(), {
      records: recordOpsBetween(
        getValueRecords(after),
        getValueRecords(settled)
      ),
    }),
  ].reduce((composed, step) => composed.compose(step));
  const relink = relinkCuts(
    repair,
    after,
    settled,
    (root) => rootOf(settled, root),
    indexOf
  );

  return relink ? repair.compose(relink.change) : repair;
};

export const createDocumentMarksValidator = () => {
  const { authorOf, validate } = createAuthoredMarksValidator();
  /** Validate the given nodes of `value`'s roots, each listed at its index. */
  const validateIn = (
    value: EditorDocumentValue,
    roots: Iterable<SparseNodes<unknown>>
  ) => {
    const facts = factsOf(value);
    const restsOn = (ctx: string, path: Path) => {
      if (!facts.contexts.has(ctx)) {
        throw new AuthoredMarkError(
          `Review context ${ctx} is missing. Save the whole read.value(), not only its children, so review contexts travel with the text.`,
          path,
          { cause: new EditorMissingReferenceError(ctx) }
        );
      }
    };

    for (const nodes of roots) validate(nodes, restsOn);
  };

  return {
    authorOf,
    validate: (value: EditorDocumentValue) =>
      validateIn(value, contentRootsOf(value).values()),
    validateIn,
  };
};

/**
 * Refuse a change that drops a context text still rests on. Contexts are never
 * removed while a room is live, so the record cannot arrive later and the
 * binding must not wait for it.
 */
const assertDroppedContextsUnused = (
  after: EditorDocumentValue,
  dropped: ReadonlySet<string>
) => {
  const { validate } = createAuthoredMarksValidator();
  const restsOn = (ctx: string, path: Path) => {
    if (dropped.has(ctx)) {
      throw new AuthoredMarkError(
        `Review context ${ctx} was dropped while text rests on it.`,
        path
      );
    }
  };

  for (const children of contentRootsOf(after).values()) {
    validate(children, restsOn);
  }
};

export const authoredAdmission: DocumentAdmission = {
  commit: ({ after, before, change, editor, indexOf }) => {
    const records = getInternalDocumentChangeRecords(change);
    const dropped = new Set(
      [...(records.get(CONTEXTS) ?? [])].flatMap(([ctx, json]) =>
        json === null ? [ctx] : []
      )
    );

    assertRecordWrites(getValueRecords(after), records);
    if (dropped.size > 0) assertDroppedContextsUnused(after, dropped);

    const previous = insertionsOf(before);
    const added = new Map<string, number>();
    const roots = contentRootsOf(after);
    const scope = new Map<string, readonly number[]>();
    const beforeFacts = factsOf(before);
    const facts = factsOf(after);

    for (const root of new Set([...previous.roots.keys(), ...roots.keys()])) {
      const old = previous.roots.get(root) ?? NO_NODES;
      const next = roots.get(root) ?? NO_NODES;

      if (old === next) continue;

      const ranges = changedChildren(change, root, before, indexOf(root));

      for (const [fromBefore, toBefore, from, to] of ranges) {
        for (const node of old.slice(fromBefore, toBefore)) {
          addCounts(added, insertionsIn(node, beforeFacts), -1);
        }
        for (const node of next.slice(from, to)) {
          addCounts(added, insertionsIn(node, facts), 1);
        }
      }
      if (next.length > 0 && ranges.length > 0) {
        scope.set(root, childrenAround(ranges, next.length));
      }
    }

    const writes = new Map<string, number | undefined>();
    const flipped: string[] = [];

    for (const [incarnation, count] of added) {
      const was = previous.counts.get(incarnation) ?? 0;
      const now = was + count;

      writes.set(incarnation, now === 0 ? undefined : now);
      // A replaced block takes its insertions away and back, so only an
      // incarnation whose count changed sign across the commit flipped.
      if (was > 0 !== now > 0 && facts.hasVerdict(incarnation)) {
        flipped.push(incarnation);
      }
    }

    const counts = previous.counts.with(writes);

    rememberInsertions(after, counts);

    const repairs = new Map<string, RootChange>();

    if (getActiveEditorUpdateTags(editor).includes('historic')) {
      const reading = keyReadingOf(facts, getCompiledEditorSchema(editor));

      for (const root of scope.keys()) {
        const rootChange = getInternalDocumentRootChange(change, root);

        if (!rootChange || !previous.roots.has(root)) continue;
        const repair = repairRejectedTags(
          rootChange,
          getInternalDocumentChangeRanges(change, root),
          rootOf(before, root),
          indexOf(root),
          reading
        );

        if (repair) repairs.set(root, repair);
      }
    }

    const replay =
      repairs.size === 0 ? null : createInternalDocumentChange(repairs);
    const replayed = replay ? replay.apply(after) : after;
    const compacted = compactClaims(replayed, scope);
    const compactedFacts = factsOf(compacted);
    // A verdict, or an incarnation a verdict names starting or stopping to
    // insert, settles claims in every block naming that incarnation.
    const decided = [
      ...verdictIncarnationsOf(records.get(VERDICTS)?.keys() ?? []),
      ...flipped,
    ];
    const settled = new Map(
      [...scope].map(([root, at]) => [root, new Set(at)])
    );
    const restoreMissingFormats =
      getActiveEditorUpdateTags(editor).includes('collaboration');

    if (!compactedFacts.hasVerdicts && restoreMissingFormats) {
      for (const root of scope.keys()) {
        if (!previous.roots.has(root) || !roots.has(root)) continue;
        const changed = rootOf(before, root).changedChildren(
          rootOf(compacted, root)
        );
        settled.set(
          root,
          new Set(
            changed.flatMap((range) =>
              Array.from(
                { length: range[3] - range[2] },
                (_, offset) => range[2] + offset
              )
            )
          )
        );
      }
    }

    if (decided.length > 0) {
      const ledger = getDefined(getReviewLedger(getEditorRuntimeOwner(editor)));

      for (const [root, ranks] of ledger.ranksNaming(after, decided)) {
        const at = settled.get(root) ?? new Set<number>();

        for (const rank of ranks) at.add(rank);
        settled.set(root, at);
      }
    }

    const settlement = settleValue(
      compacted,
      { ...compactedFacts, insertedIncarnations: () => counts },
      settled,
      {
        resolveSchema: () => authoredResolveSchemaOf(editor),
        returnsHeld: true,
        restoreMissingFormats,
        schema: getCompiledEditorSchema(editor),
      }
    );
    const admitted = settlement.value ?? compacted;

    return admitted === after
      ? null
      : repairOf(
          after,
          admitted,
          [
            replay,
            compacted === replayed
              ? null
              : compactionChange(replayed, compacted, scope),
            settlement.change,
          ],
          indexOf
        );
  },
  load: (document, schema) => {
    assertRecordStore(getValueRecords(document));
    createDocumentMarksValidator().validate(document);

    const compacted = compactClaims(document);
    const facts = factsOf(compacted);
    const settlement = settleValue(compacted, facts, 'document', {
      resolveSchema: () => storedResolveSchemaOf(schema, compacted),
      schema,
    });
    const value = settlement.value ?? compacted;

    if (value === document) return null;

    const change = repairOf(
      document,
      value,
      [
        compacted === document ? null : compactionChange(document, compacted),
        settlement.change,
      ],
      (root) => rootOf(document, root)
    );

    return { change, value: change.apply(document) };
  },
};
