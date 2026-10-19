import {
  DocumentChange,
  type EditorDocumentValue,
  type EditorStateSchemaApi,
  type Value,
} from '../..';
import { createComparisonIndex } from './comparison-index';
import {
  assertComparisonActive,
  COMPARISON_POLICY,
  comparisonDocumentsEqual,
  comparisonHash,
  createComparisonSnapshot,
  detachComparisonDocument,
  detachComparisonEnvelope,
  selectComparisonDocumentChange,
  yieldComparisonWork,
} from './comparison-internal';
import { matchComparison } from './comparison-matcher';
import type {
  ComparedChange,
  ComparisonBranch,
  ComparisonConflict,
  ComparisonDiagnostic,
  ComparisonEffect,
  ComparisonEvidence,
  ComparisonResolution,
  ComparisonResolutionResult,
  ComparisonSpan,
  ThreeWayComparison,
  TwoWayComparison,
} from './comparison-types';

type TwoWayInput<V extends Value> = Readonly<{
  after: unknown;
  before: unknown;
  projection?: Readonly<{
    after: 'accepted' | 'proposed';
    before: 'accepted' | 'proposed';
  }>;
  schema: EditorStateSchemaApi<V>;
  signal?: AbortSignal;
}>;

type ThreeWayInput<V extends Value> = Readonly<{
  base: unknown;
  local: unknown;
  remote: unknown;
  schema: EditorStateSchemaApi<V>;
  signal?: AbortSignal;
}>;

type ThreeWayState<V extends Value> = Readonly<{
  commonRemoteIds: ReadonlySet<string>;
  local: TwoWayComparison<V>;
  localIds: ReadonlyMap<string, string>;
  remote: TwoWayComparison<V>;
  remoteIds: ReadonlyMap<string, string>;
  schema: EditorStateSchemaApi<V>;
}>;

const THREE_WAY_STATE = new WeakMap<ThreeWayComparison, ThreeWayState<Value>>();

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

const groupSemanticKey = (group: ComparedChange) =>
  comparisonHash({
    after: group.after,
    before: group.before,
    correspondence: group.correspondence.map(
      ({ after, before, evidence, kind }) => ({ after, before, evidence, kind })
    ),
    effects: group.effects.map(({ id: _id, ...effect }) => effect),
    evidence: group.evidence,
  });

const publishThreeWayGroup = (
  comparisonId: string,
  index: number,
  group: ComparedChange,
  branches: readonly ComparisonBranch[]
): ComparedChange => {
  const id = `${comparisonId}:change:${index}`;

  return Object.freeze({
    after: group.after,
    before: group.before,
    branches: Object.freeze([...branches]),
    correspondence: Object.freeze(
      group.correspondence.map((item, correspondenceIndex) =>
        Object.freeze({
          ...item,
          id: `${id}:correspondence:${correspondenceIndex}`,
        })
      )
    ),
    effects: Object.freeze(
      group.effects.map((effect, effectIndex) =>
        Object.freeze({ ...effect, id: `${id}:effect:${effectIndex}` })
      )
    ),
    evidence: group.evidence,
    id,
    requiredChangeIds: Object.freeze([]),
  });
};

const spansTouch = (
  left: readonly ComparisonSpan[],
  right: readonly ComparisonSpan[]
) =>
  left.some((a) =>
    right.some((b) => {
      if (a.root !== b.root) return false;
      if (a.from === a.to && b.from === b.to) return a.from === b.from;
      if (a.from === a.to) return b.from <= a.from && a.from <= b.to;
      if (b.from === b.to) return a.from <= b.from && b.from <= a.to;

      return Math.max(a.from, b.from) < Math.min(a.to, b.to);
    })
  );

const propertyKeys = (group: ComparedChange) =>
  new Set(
    group.effects.flatMap((effect) =>
      effect.kind === 'property'
        ? [...effect.beforeProperties, ...effect.afterProperties].flatMap(
            Object.keys
          )
        : []
    )
  );

const groupsConflict = (left: ComparedChange, right: ComparedChange) => {
  if (!spansTouch(left.before, right.before)) return false;

  const leftKinds = new Set(left.effects.map(({ kind }) => kind));
  const rightKinds = new Set(right.effects.map(({ kind }) => kind));
  const placementWithContent =
    (leftKinds.size === 1 &&
      leftKinds.has('placement') &&
      [...rightKinds].every(
        (kind) => kind === 'text' || kind === 'property'
      )) ||
    (rightKinds.size === 1 &&
      rightKinds.has('placement') &&
      [...leftKinds].every((kind) => kind === 'text' || kind === 'property'));

  if (placementWithContent) return false;
  if (
    [...leftKinds].every((kind) => kind === 'property') &&
    [...rightKinds].every((kind) => kind === 'property')
  ) {
    const rightProperties = propertyKeys(right);

    return [...propertyKeys(left)].some((key) => rightProperties.has(key));
  }

  return true;
};

const conflictKind = (
  local: readonly ComparedChange[],
  remote: readonly ComparedChange[],
  gridSpans: readonly ComparisonSpan[]
): ComparisonConflict['kind'] => {
  const effects = [...local, ...remote].flatMap(({ effects: value }) => value);
  const kinds = new Set(effects.map(({ kind }) => kind));

  if (kinds.has('root-create') || kinds.has('root-delete')) return 'root';
  if (
    [...local, ...remote].some(({ before }) => spansTouch(before, gridSpans))
  ) {
    return 'grid';
  }
  if (
    kinds.has('delete') &&
    [...kinds].some((kind) => kind !== 'delete' && kind !== 'structure')
  ) {
    return 'delete-edit';
  }
  if (kinds.has('placement')) return 'placement';
  if (
    local.every(({ effects: value }) =>
      value.some(({ kind }) => kind === 'insert')
    ) &&
    remote.every(({ effects: value }) =>
      value.some(({ kind }) => kind === 'insert')
    )
  ) {
    return 'order';
  }

  return 'structure';
};

const uniqueSpans = (spans: readonly ComparisonSpan[]) =>
  Object.freeze([
    ...new Map(
      spans.map((span) => [`${span.root}:${span.from}:${span.to}`, span])
    ).values(),
  ]);

const buildConflicts = (
  comparisonId: string,
  local: readonly ComparedChange[],
  remote: readonly ComparedChange[],
  gridSpans: readonly ComparisonSpan[]
): readonly ComparisonConflict[] => {
  const edges = local.flatMap((localGroup) =>
    remote.flatMap((remoteGroup) =>
      groupsConflict(localGroup, remoteGroup)
        ? [
            Object.freeze({
              local: localGroup,
              remote: remoteGroup,
            }),
          ]
        : []
    )
  );
  const pending = [...edges];
  const components: Array<{
    local: Set<ComparedChange>;
    remote: Set<ComparedChange>;
  }> = [];

  while (pending.length > 0) {
    const first = pending.shift();
    if (!first) break;
    const component = {
      local: new Set([first.local]),
      remote: new Set([first.remote]),
    };
    let expanded = true;

    while (expanded) {
      expanded = false;
      for (let index = pending.length - 1; index >= 0; index--) {
        const edge = pending[index];
        if (!edge) continue;

        if (
          component.local.has(edge.local) ||
          component.remote.has(edge.remote)
        ) {
          component.local.add(edge.local);
          component.remote.add(edge.remote);
          pending.splice(index, 1);
          expanded = true;
        }
      }
    }
    components.push(component);
  }

  return Object.freeze(
    components.map((component, index) => {
      const localGroups = [...component.local];
      const remoteGroups = [...component.remote];
      const localIds = Object.freeze(localGroups.map(({ id }) => id));
      const remoteIds = Object.freeze(remoteGroups.map(({ id }) => id));
      const kind = conflictKind(localGroups, remoteGroups, gridSpans);
      const changeIds = Object.freeze([...localIds, ...remoteIds]);
      const requiredChangeIds = Object.freeze(
        [
          ...new Set(
            [...localGroups, ...remoteGroups].flatMap(
              ({ requiredChangeIds: ids }) => ids
            )
          ),
        ].filter((id) => !changeIds.includes(id))
      );

      return Object.freeze({
        base: uniqueSpans(
          [...localGroups, ...remoteGroups].flatMap(({ before }) => before)
        ),
        changeIds,
        id: `${comparisonId}:conflict:${index}:${comparisonHash({
          kind,
          localIds,
          remoteIds,
        })}`,
        kind,
        local: Object.freeze({
          branch: 'local' as const,
          changeIds: localIds,
          spans: uniqueSpans(localGroups.flatMap(({ after }) => after)),
        }),
        remote: Object.freeze({
          branch: 'remote' as const,
          changeIds: remoteIds,
          spans: uniqueSpans(remoteGroups.flatMap(({ after }) => after)),
        }),
        requiredChangeIds,
      });
    })
  );
};

const compareTwoWay = async <V extends Value>(
  input: TwoWayInput<V>
): Promise<TwoWayComparison<V>> => {
  assertComparisonActive(input.signal);
  const beforeEnvelopeFingerprint = detachComparisonEnvelope(input.before);
  const afterEnvelopeFingerprint = detachComparisonEnvelope(input.after);
  const beforeDocument = detachComparisonDocument(input.before, input.schema);
  const afterDocument = detachComparisonDocument(input.after, input.schema);
  const before = createComparisonSnapshot(
    beforeDocument,
    input.schema,
    input.projection?.before ?? 'accepted',
    beforeEnvelopeFingerprint
  );
  const after = createComparisonSnapshot(
    afterDocument,
    input.schema,
    input.projection?.after ?? 'accepted',
    afterEnvelopeFingerprint
  );

  await yieldComparisonWork(input.signal);
  const id = `comparison:${comparisonHash({
    after: after.fingerprint,
    before: before.fingerprint,
    policy: COMPARISON_POLICY,
  })}`;
  const change = DocumentChange.between(beforeDocument, afterDocument);
  const reconstructed = change.apply(beforeDocument);
  const inverse = change.invert(beforeDocument);

  if (!comparisonDocumentsEqual(reconstructed, afterDocument)) {
    throw new Error(
      'Comparison change does not reconstruct the target document.'
    );
  }
  if (!comparisonDocumentsEqual(inverse.apply(afterDocument), beforeDocument)) {
    throw new Error(
      'Comparison inverse does not reconstruct the source document.'
    );
  }

  const beforeIndex = createComparisonIndex(beforeDocument, input.schema);
  const afterIndex = createComparisonIndex(afterDocument, input.schema);
  const matched = await matchComparison(beforeIndex, afterIndex, id, {
    createdRoots: change.createRoots,
    deletedRoots: change.deleteRoots,
    signal: input.signal,
  });
  const { changes: matchedChanges, diagnostics: matchedDiagnostics } = matched;
  let changes = matchedChanges;
  let diagnostics = matchedDiagnostics;

  if (!change.empty && changes.length === 0 && !matched.visibleEquivalent) {
    const fallback = coarseFallback(id, beforeIndex, afterIndex);

    changes = Object.freeze([fallback.change]);
    diagnostics = Object.freeze([...diagnostics, fallback.diagnostic]);
  }

  assertComparisonActive(input.signal);
  const comparisonId = `${id}:${comparisonHash({
    change: change.toJSON(),
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
    kind: 'two-way',
    policy: COMPARISON_POLICY,
  });
};

const compareThreeWay = async <V extends Value>(
  input: ThreeWayInput<V>
): Promise<ThreeWayComparison<V>> => {
  assertComparisonActive(input.signal);
  const [local, remote] = await Promise.all([
    compareTwoWay({
      after: input.local,
      before: input.base,
      schema: input.schema,
      signal: input.signal,
    }),
    compareTwoWay({
      after: input.remote,
      before: input.base,
      schema: input.schema,
      signal: input.signal,
    }),
  ]);
  const base = local.before;
  const id = `comparison:${comparisonHash({
    base: base.fingerprint,
    local: local.after.fingerprint,
    policy: COMPARISON_POLICY,
    remote: remote.after.fingerprint,
  })}`;
  const localIds = new Map<string, string>();
  const remoteIds = new Map<string, string>();
  const commonRemoteIds = new Set<string>();
  const remoteByKey = new Map<string, ComparedChange[]>();

  for (const group of remote.changes) {
    const key = groupSemanticKey(group);
    const bucket = remoteByKey.get(key) ?? [];

    bucket.push(group);
    remoteByKey.set(key, bucket);
  }

  const staged: Array<
    Readonly<{
      branches: readonly ComparisonBranch[];
      group: ComparedChange;
      localId?: string;
      remoteId?: string;
    }>
  > = [];
  for (const group of local.changes) {
    const matching = remoteByKey.get(groupSemanticKey(group))?.shift();

    staged.push(
      Object.freeze({
        branches: matching
          ? Object.freeze(['local', 'remote'] as const)
          : Object.freeze(['local'] as const),
        group,
        localId: group.id,
        ...(matching ? { remoteId: matching.id } : {}),
      })
    );
  }
  for (const groups of remoteByKey.values()) {
    for (const group of groups) {
      staged.push(
        Object.freeze({
          branches: Object.freeze(['remote'] as const),
          group,
          remoteId: group.id,
        })
      );
    }
  }

  const published = staged.map((item, index) => {
    const group = publishThreeWayGroup(id, index, item.group, item.branches);

    if (item.localId) localIds.set(group.id, item.localId);
    if (item.remoteId) {
      remoteIds.set(group.id, item.remoteId);
      if (item.localId) commonRemoteIds.add(group.id);
    }

    return group;
  });
  const localPublicBySource = new Map(
    [...localIds].map(([publishedId, sourceId]) => [sourceId, publishedId])
  );
  const remotePublicBySource = new Map(
    [...remoteIds].map(([publishedId, sourceId]) => [sourceId, publishedId])
  );
  const changes = Object.freeze(
    published.map((group, index) => {
      const source = staged[index];
      if (!source) throw new Error('Missing three-way comparison source.');
      const requiredChangeIds = Object.freeze([
        ...new Set(
          [
            ...(source.localId
              ? (local.changes
                  .find(({ id: sourceId }) => sourceId === source.localId)
                  ?.requiredChangeIds.map((sourceId) =>
                    localPublicBySource.get(sourceId)
                  ) ?? [])
              : []),
            ...(source.remoteId
              ? (remote.changes
                  .find(({ id: sourceId }) => sourceId === source.remoteId)
                  ?.requiredChangeIds.map((sourceId) =>
                    remotePublicBySource.get(sourceId)
                  ) ?? [])
              : []),
          ].filter((required): required is string =>
            Boolean(required && required !== group.id)
          )
        ),
      ]);

      return Object.freeze({ ...group, requiredChangeIds });
    })
  );
  const localGroups = changes.filter(({ branches }) =>
    branches?.includes('local')
  );
  const remoteGroups = changes.filter(
    ({ branches, id: groupId }) =>
      branches?.includes('remote') && !commonRemoteIds.has(groupId)
  );
  const gridSpans = createComparisonIndex(
    base.document,
    input.schema
  ).nodes.flatMap(({ span, structure }) =>
    structure?.kind === 'grid' ? [span] : []
  );
  const conflicts = buildConflicts(id, localGroups, remoteGroups, gridSpans);
  const diagnostics = Object.freeze([
    ...local.diagnostics,
    ...remote.diagnostics,
    ...(conflicts.length > 0
      ? [
          Object.freeze({
            code: 'ambiguous' as const,
            message:
              'Concurrent branch contributions require explicit conflict resolution.',
            severity: 'warning' as const,
            spans: uniqueSpans(conflicts.flatMap(({ base: spans }) => spans)),
          }),
        ]
      : []),
  ]);
  const comparisonId = `${id}:${comparisonHash({
    changes,
    conflicts,
    diagnostics,
  })}`;
  const comparison = Object.freeze({
    base,
    changes,
    conflicts,
    diagnostics,
    id: comparisonId,
    kind: 'three-way' as const,
    local: local.after,
    policy: COMPARISON_POLICY,
    remote: remote.after,
  });

  THREE_WAY_STATE.set(
    comparison,
    Object.freeze({
      commonRemoteIds,
      local,
      localIds,
      remote,
      remoteIds,
      schema: input.schema,
    })
  );

  return comparison;
};

/** Compare immutable schema-valid documents without installing editor state. */
export function compare<V extends Value>(
  input: ThreeWayInput<V>
): Promise<ThreeWayComparison<V>>;
export function compare<V extends Value>(
  input: TwoWayInput<V>
): Promise<TwoWayComparison<V>>;
export function compare<V extends Value>(
  input: TwoWayInput<V> | ThreeWayInput<V>
): Promise<TwoWayComparison<V> | ThreeWayComparison<V>> {
  return 'base' in input ? compareThreeWay(input) : compareTwoWay(input);
}

const invalidResolution = <V extends Value>(
  message: string
): ComparisonResolutionResult<V> =>
  Object.freeze({
    diagnostics: Object.freeze([
      Object.freeze({
        code: 'invalid-resolution' as const,
        message,
        severity: 'warning' as const,
      }),
    ]),
    status: 'invalid' as const,
  });

const annotateResolvedComparison = <V extends Value>(
  comparison: TwoWayComparison<V>,
  branches: readonly ComparisonBranch[]
): TwoWayComparison<V> => {
  if (comparison.changes.length === 0 || branches.length === 0) {
    return comparison;
  }
  const changes = Object.freeze(
    comparison.changes.map((group) =>
      Object.freeze({ ...group, branches: Object.freeze([...branches]) })
    )
  );
  const prefix = `comparison:${comparisonHash({
    after: comparison.after.fingerprint,
    before: comparison.before.fingerprint,
    policy: comparison.policy,
  })}`;

  return Object.freeze({
    ...comparison,
    changes,
    id: `${prefix}:${comparisonHash({
      change: comparison.change.toJSON(),
      changes,
      diagnostics: comparison.diagnostics,
    })}`,
  });
};

const restoreBaselineSnapshot = <V extends Value>(
  comparison: TwoWayComparison<V>,
  before: TwoWayComparison<V>['before']
): TwoWayComparison<V> => {
  const prefix = `comparison:${comparisonHash({
    after: comparison.after.fingerprint,
    before: before.fingerprint,
    policy: comparison.policy,
  })}`;

  return Object.freeze({
    ...comparison,
    before,
    id: `${prefix}:${comparisonHash({
      change: comparison.change.toJSON(),
      changes: comparison.changes,
      diagnostics: comparison.diagnostics,
    })}`,
  });
};

/** Resolve one published three-way comparison without rematching its inputs. */
export async function resolveComparison<V extends Value>(
  input: Readonly<{
    baseline: 'base' | ComparisonBranch;
    comparison: ThreeWayComparison<V>;
    resolutions?: readonly ComparisonResolution[];
    signal?: AbortSignal;
  }>
): Promise<ComparisonResolutionResult<V>> {
  assertComparisonActive(input.signal);
  const state = THREE_WAY_STATE.get(input.comparison) as
    | ThreeWayState<V>
    | undefined;

  if (!state) {
    return invalidResolution(
      'The comparison was not created by this resolver.'
    );
  }
  const resolutions = input.resolutions ?? [];
  const byConflict = new Map<string, ComparisonResolution>();
  for (const resolution of resolutions) {
    if (
      resolution.comparisonId !== input.comparison.id ||
      byConflict.has(resolution.conflictId) ||
      !input.comparison.conflicts.some(({ id }) => id === resolution.conflictId)
    ) {
      return invalidResolution(
        'A resolution has an unknown, duplicate, or stale comparison identity.'
      );
    }
    byConflict.set(resolution.conflictId, resolution);
  }
  const unresolved = input.comparison.conflicts.filter(
    ({ id }) => !byConflict.has(id)
  );

  if (unresolved.length > 0) {
    return Object.freeze({
      conflicts: Object.freeze([...unresolved]),
      status: 'unresolved' as const,
    });
  }

  const customChoices = resolutions.filter(
    ({ choice }) => typeof choice === 'object'
  );
  if (customChoices.length > 0) {
    if (
      customChoices.length !== resolutions.length ||
      customChoices.length !== input.comparison.conflicts.length
    ) {
      return invalidResolution(
        'Custom resolution documents must resolve every conflict together.'
      );
    }
    let target: Pick<EditorDocumentValue<V>, 'children' | 'roots'>;
    try {
      const custom = customChoices[0];
      if (!custom) {
        return invalidResolution('A custom resolution target is missing.');
      }
      target = detachComparisonDocument(
        (custom.choice as { document: unknown }).document,
        state.schema
      );
      if (
        customChoices.some(({ choice }) => {
          const document = detachComparisonDocument(
            (choice as { document: unknown }).document,
            state.schema
          );

          return !comparisonDocumentsEqual(document, target);
        })
      ) {
        return invalidResolution(
          'Custom resolutions must name one identical target document.'
        );
      }
    } catch {
      return invalidResolution(
        'A custom resolution document does not satisfy the comparison schema.'
      );
    }
    const baseline = input.comparison[input.baseline];
    const comparison = restoreBaselineSnapshot(
      await compareTwoWay({
        after: target,
        before: baseline.document,
        schema: state.schema,
        signal: input.signal,
      }),
      baseline
    );

    return Object.freeze({ comparison, status: 'resolved' as const });
  }

  const localSelected = new Set(state.localIds.keys());
  const remoteSelected = new Set(
    [...state.remoteIds.keys()].filter(
      (groupId) => !state.commonRemoteIds.has(groupId)
    )
  );
  for (const conflict of input.comparison.conflicts) {
    const choice = byConflict.get(conflict.id)?.choice;

    if (choice === 'local') {
      for (const groupId of conflict.remote.changeIds) {
        remoteSelected.delete(groupId);
      }
    } else if (choice === 'remote') {
      for (const groupId of conflict.local.changeIds) {
        localSelected.delete(groupId);
      }
    }
  }

  const localSourceIds = new Set(
    [...localSelected].flatMap((id) => {
      const sourceId = state.localIds.get(id);

      return sourceId ? [sourceId] : [];
    })
  );
  const remoteSourceIds = new Set(
    [...remoteSelected].flatMap((id) => {
      const sourceId = state.remoteIds.get(id);

      return sourceId ? [sourceId] : [];
    })
  );
  let target: Pick<EditorDocumentValue<V>, 'children' | 'roots'>;
  try {
    const localChange = selectComparisonDocumentChange(
      state.local,
      localSourceIds
    );
    const remoteChange = selectComparisonDocumentChange(
      state.remote,
      remoteSourceIds
    );
    const transformed = DocumentChange.transform(
      localChange,
      remoteChange,
      input.comparison.base.document
    );

    target = detachComparisonDocument(
      transformed.b.apply(localChange.apply(input.comparison.base.document)),
      state.schema
    );
  } catch {
    return invalidResolution(
      'The selected branch contributions do not form one schema-valid document.'
    );
  }

  const baseline = input.comparison[input.baseline];
  const compared = restoreBaselineSnapshot(
    await compareTwoWay({
      after: target,
      before: baseline.document,
      schema: state.schema,
      signal: input.signal,
    }),
    baseline
  );
  const branches = Object.freeze([
    ...(localSourceIds.size > 0 ? (['local'] as const) : []),
    ...(remoteSourceIds.size > 0 ? (['remote'] as const) : []),
  ]);

  return Object.freeze({
    comparison: annotateResolvedComparison(compared, branches),
    status: 'resolved' as const,
  });
}
