import type { EditorStateSchemaApi, Value } from '../..';
import { createComparisonIndex } from './comparison-index';
import {
  assertComparisonActive,
  COMPARISON_POLICY,
  comparisonChangeHashPayload,
  comparisonDocumentsEqual,
  comparisonHash,
  createComparisonSnapshot,
  detachComparisonDocument,
  detachComparisonEnvelope,
  fillComparisonElementIds,
  needsComparisonElementIds,
  stripComparisonElementIds,
  yieldComparisonWork,
} from './comparison-internal';
import { matchComparison } from './comparison-matcher';
import { planComparison } from './comparison-plan';
import type {
  ComparedChange,
  Comparison,
  ComparisonDiagnostic,
  ComparisonEffect,
  ComparisonEvidence,
  ComparisonSpan,
} from './comparison-types';

type CompareInput<V extends Value> = Readonly<{
  after: unknown;
  before: unknown;
  projection?: Readonly<{
    after: 'accepted' | 'proposed';
    before: 'accepted' | 'proposed';
  }>;
  schema: EditorStateSchemaApi<V>;
  signal?: AbortSignal;
}>;

const allRootSpans = (
  index: ReturnType<typeof createComparisonIndex>
): readonly ComparisonSpan[] =>
  Object.freeze(
    [...index.roots.values()].map(({ length, name }) =>
      Object.freeze({ from: 0, root: name, to: length })
    )
  );

const coarseFallback = (
  id: string,
  before: ReturnType<typeof createComparisonIndex>,
  after: ReturnType<typeof createComparisonIndex>
): Readonly<{ change: ComparedChange; diagnostic: ComparisonDiagnostic }> => {
  const beforeSpans = allRootSpans(before);
  const afterSpans = allRootSpans(after);
  const evidence: ComparisonEvidence = Object.freeze({
    basis: 'replacement',
    kind: 'inferred',
  });
  const effect: ComparisonEffect = Object.freeze({
    after: afterSpans,
    before: beforeSpans,
    id: `${id}:effect:0`,
    kind: 'structure',
  });

  return Object.freeze({
    change: Object.freeze({
      after: afterSpans,
      before: beforeSpans,
      correspondence: Object.freeze([
        Object.freeze({
          after: afterSpans,
          before: beforeSpans,
          evidence,
          id: `${id}:correspondence:0`,
          kind: 'primary',
        }),
      ]),
      effects: Object.freeze([effect]),
      evidence,
      id: `${id}:change:0`,
      requiredChangeIds: Object.freeze([]),
    }),
    diagnostic: Object.freeze({
      code: 'coarse-replacement',
      message:
        'The exact canonical change is available, but semantic grouping fell back to a complete document replacement.',
      severity: 'warning',
      spans: Object.freeze([...beforeSpans, ...afterSpans]),
    }),
  });
};

const rekeyComparedChanges = (
  changes: readonly ComparedChange[],
  fromPrefix: string,
  toPrefix: string
): readonly ComparedChange[] => {
  const rekey = (value: string) =>
    value.startsWith(fromPrefix)
      ? `${toPrefix}${value.slice(fromPrefix.length)}`
      : value;

  return Object.freeze(
    changes.map((group) =>
      Object.freeze({
        ...group,
        correspondence: Object.freeze(
          group.correspondence.map((item) =>
            Object.freeze({ ...item, id: rekey(item.id) })
          )
        ),
        effects: Object.freeze(
          group.effects.map((effect) =>
            Object.freeze({ ...effect, id: rekey(effect.id) })
          )
        ),
        id: rekey(group.id),
        requiredChangeIds: Object.freeze(group.requiredChangeIds.map(rekey)),
      })
    )
  );
};

/** Compare two immutable schema-valid documents without installing editor state. */
export async function compare<V extends Value>(
  input: CompareInput<V>
): Promise<Comparison<V>> {
  assertComparisonActive(input.signal);
  const beforeEnvelopeFingerprint = detachComparisonEnvelope(input.before);
  const afterEnvelopeFingerprint = detachComparisonEnvelope(input.after);
  const beforeDocument = detachComparisonDocument(input.before, input.schema);
  const rawAfterDocument = detachComparisonDocument(input.after, input.schema);
  const fillsIds = needsComparisonElementIds(beforeDocument, rawAfterDocument);
  const before = createComparisonSnapshot(
    beforeDocument,
    input.schema,
    input.projection?.before ?? 'accepted',
    beforeEnvelopeFingerprint
  );
  const beforeRoots = beforeDocument.roots ?? {};
  const rawAfterRoots = rawAfterDocument.roots ?? {};
  const matchOptions = {
    createdRoots: new Set(
      Object.keys(rawAfterRoots).filter(
        (root) => !Object.hasOwn(beforeRoots, root)
      )
    ),
    deletedRoots: new Set(
      Object.keys(beforeRoots).filter(
        (root) => !Object.hasOwn(rawAfterRoots, root)
      )
    ),
    signal: input.signal,
  };

  let afterDocument = rawAfterDocument;
  let after: ReturnType<typeof createComparisonSnapshot<V>>;
  let id: string;
  let beforeIndex: ReturnType<typeof createComparisonIndex>;
  let afterIndex: ReturnType<typeof createComparisonIndex>;
  let matched: Awaited<ReturnType<typeof matchComparison>>;
  let matchedChanges: readonly ComparedChange[];
  let diagnostics: readonly ComparisonDiagnostic[];

  if (fillsIds) {
    await yieldComparisonWork(input.signal);
    const matchPrefix = 'comparison:pending';
    const beforeMatchIndex = createComparisonIndex(
      stripComparisonElementIds(beforeDocument),
      input.schema
    );
    const afterMatchIndex = createComparisonIndex(
      stripComparisonElementIds(rawAfterDocument),
      input.schema
    );

    matched = await matchComparison(
      beforeMatchIndex,
      afterMatchIndex,
      matchPrefix,
      matchOptions
    );
    afterDocument = fillComparisonElementIds(
      beforeDocument,
      rawAfterDocument,
      beforeMatchIndex,
      afterMatchIndex,
      matched.inPlaceMatches
    );
    after = createComparisonSnapshot(
      afterDocument,
      input.schema,
      input.projection?.after ?? 'accepted',
      afterEnvelopeFingerprint
    );
    id = `comparison:${comparisonHash({
      after: after.fingerprint,
      before: before.fingerprint,
      policy: COMPARISON_POLICY,
    })}`;
    beforeIndex = createComparisonIndex(beforeDocument, input.schema);
    afterIndex = createComparisonIndex(afterDocument, input.schema);
    matchedChanges = rekeyComparedChanges(matched.changes, matchPrefix, id);
    ({ diagnostics } = matched);
  } else {
    after = createComparisonSnapshot(
      afterDocument,
      input.schema,
      input.projection?.after ?? 'accepted',
      afterEnvelopeFingerprint
    );
    await yieldComparisonWork(input.signal);
    id = `comparison:${comparisonHash({
      after: after.fingerprint,
      before: before.fingerprint,
      policy: COMPARISON_POLICY,
    })}`;
    beforeIndex = createComparisonIndex(beforeDocument, input.schema);
    afterIndex = createComparisonIndex(afterDocument, input.schema);
    matched = await matchComparison(beforeIndex, afterIndex, id, matchOptions);
    ({ changes: matchedChanges, diagnostics } = matched);
  }

  if (
    matchedChanges.length === 0 &&
    !matched.visibleEquivalent &&
    !comparisonDocumentsEqual(beforeDocument, afterDocument)
  ) {
    const fallback = coarseFallback(id, beforeIndex, afterIndex);

    matchedChanges = Object.freeze([fallback.change]);
    diagnostics = Object.freeze([...diagnostics, fallback.diagnostic]);
  }

  const plan = planComparison({
    after: afterDocument,
    afterIndex,
    before: beforeDocument,
    beforeIndex,
    groups: matchedChanges,
  });
  const { change, changes } = plan;

  if (!comparisonDocumentsEqual(change.apply(beforeDocument), afterDocument)) {
    throw new Error(
      'Comparison change does not reconstruct the target document.'
    );
  }
  if (
    !comparisonDocumentsEqual(
      change.invert(beforeDocument).apply(afterDocument),
      beforeDocument
    )
  ) {
    throw new Error(
      'Comparison inverse does not reconstruct the source document.'
    );
  }

  assertComparisonActive(input.signal);
  const comparisonId = `${id}:${comparisonHash({
    change: comparisonChangeHashPayload(change),
    changes,
    diagnostics,
  })}`;

  return Object.freeze({
    after,
    before,
    change,
    changes,
    diagnostics,
    id: comparisonId,
    policy: COMPARISON_POLICY,
  });
}
