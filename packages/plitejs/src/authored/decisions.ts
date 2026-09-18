import { ChangeDraft } from '../core/change/builder';
import {
  DocumentChange,
  getInternalDocumentChangeEntries,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { RootChangeJson } from '../core/change/root-change';
import { jsonEqual, type JsonEditorValue } from '../core/change/tokens';
import {
  getCompiledEditorSchemaFromApi,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { EditorSchemaValidationError } from '../core/schema-validation';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import type {
  PropertySetDescriptor,
  PropertyValueDescriptor,
} from '../interfaces/schema';
import { getDefined } from '../internal/get-defined';
import {
  authoredPositionAt,
  insertAuthoredPositionBatch,
  resolveAuthoredPosition,
  type AuthoredSpan,
} from './positions';
import { readRecord, records, writeRecord } from './record-tree';
import {
  authoredDependants,
  isAuthoredEditVisible,
  observesAuthoredOperation,
  hasAuthoredPropertyProjection,
  hasAuthoredContent,
  materializeAuthoredEdit,
  authoredOperationPropertySteps,
  authoredStatusBeforeReview,
  reviewComponent,
  type AuthoredEdit,
  type AuthoredOperation,
  type AuthoredState,
  type AuthoredReview,
  type AuthoredRecord,
} from './state';
import {
  AuthoredMappingConflictError,
  authoredOperationOrigin,
  authoredRootNodes,
  mapAuthoredChange,
  projectAuthoredTextProperties,
  type AuthoredPositionRoots,
} from './steps';
import type {
  AuthoredDecision,
  AuthoredResult,
  AuthoredSelection,
} from './types';

const hasCustomValidation = (descriptor: PropertyValueDescriptor): boolean =>
  !!descriptor.validate ||
  (descriptor.kind === 'set' &&
    hasCustomValidation((descriptor as PropertySetDescriptor).item));

export type AuthoredProjection = Readonly<{
  accepted: EditorDocumentValue;
  acceptedPositions: AuthoredPositionRoots;
  projected: EditorDocumentValue;
  projectedPositions: AuthoredPositionRoots;
}>;

export const inspectAuthoredSelection = (
  state: AuthoredState,
  selection: AuthoredSelection
):
  | { status: 'ready'; ids: string[]; changes: AuthoredRecord[] }
  | AuthoredResult => {
  if (!selection || !Array.isArray(selection.changes)) {
    return { status: 'invalid', reason: 'selection' };
  }
  if (selection.documentId !== state.documentId) {
    return { status: 'invalid', reason: 'document' };
  }
  const selected = new Set<string>();
  const stale: string[] = [];
  const changes: AuthoredRecord[] = [];
  const selectionChanges: AuthoredSelection['changes'] = selection.changes;

  for (const entry of selectionChanges) {
    if (
      !entry ||
      typeof entry.id !== 'string' ||
      !entry.id ||
      selected.has(entry.id) ||
      !Number.isSafeInteger(entry.revision) ||
      !Array.isArray(entry.heads) ||
      entry.heads.some((head) => typeof head !== 'string') ||
      new Set(entry.heads).size !== entry.heads.length
    ) {
      return { status: 'invalid', reason: 'selection' };
    }
    selected.add(entry.id);
    const change = readRecord(state.changes, entry.id);
    if (
      !change ||
      change.revision !== entry.revision ||
      change.heads.length !== entry.heads.length ||
      entry.heads.some((head) => !change.heads.includes(head))
    ) {
      stale.push(entry.id);
    } else changes.push(change);
  }
  const ids = [...selected].sort();
  if (stale.length) {
    return snapshotEditorJsonValue(
      { status: 'stale', ids: stale.sort() },
      'Authored decision result'
    );
  }
  return { status: 'ready', ids, changes };
};

export const previewAuthoredDecision = (
  state: AuthoredState,
  input: AuthoredDecision,
  resolve = false
): AuthoredResult => {
  if (!input || (input.action !== 'accept' && input.action !== 'reject')) {
    return { status: 'invalid', reason: 'selection' };
  }
  const inspected = inspectAuthoredSelection(state, input.selection);
  if (inspected.status !== 'ready') return inspected;
  const { ids, changes } = inspected;
  const selected = new Set(ids);
  const conflicts = new Set<string>();
  let pending = false;
  const target = input.action === 'accept' ? 'accepted' : 'rejected';
  for (const change of changes) {
    if (change.status === target) continue;
    pending = true;
    if (
      change.status !== 'pending' &&
      !(resolve && change.status === 'conflicted')
    ) {
      conflicts.add(change.id);
    }
  }
  if (resolve) {
    for (const identity of reviewComponent(state, ids)) {
      if (!selected.has(identity)) conflicts.add(identity);
    }
  }
  const dependencies = new Set<string>();
  const dependants = new Set<string>();
  const visited = new Set<string>();
  const visit = (identity: string) => {
    if (visited.has(identity)) return;
    visited.add(identity);
    const change = readRecord(state.changes, identity);
    if (!change) return;
    if (input.action === 'accept') {
      for (const dependency of change.dependencies) {
        const parent = readRecord(state.changes, dependency);
        if (parent?.status === 'accepted') continue;
        if (!selected.has(dependency)) dependencies.add(dependency);
        visit(dependency);
      }
    } else {
      for (const child of authoredDependants(state, identity)) {
        if (child.status === 'rejected') continue;
        if (!selected.has(child.id)) dependants.add(child.id);
        visit(child.id);
      }
    }
  };
  for (const identity of ids) visit(identity);
  if (dependencies.size || dependants.size || conflicts.size) {
    return snapshotEditorJsonValue(
      {
        status: 'blocked',
        dependencies: [...dependencies].sort(),
        dependants: [...dependants].sort(),
        conflicts: [...conflicts].sort(),
        ids,
      },
      'Authored decision result'
    );
  }
  return snapshotEditorJsonValue(
    { status: pending ? 'applied' : 'unchanged', ids },
    'Authored decision result'
  );
};

export const projectAuthoredDecision = (input: {
  editor?: Editor;
  decision: AuthoredDecision;
  projection: AuthoredProjection;
  schema?: InternalEditorSchemaApi;
  state: AuthoredState;
}) => {
  const { decision, projection, schema, state } = input;
  const accepting = decision.action === 'accept';
  const operations: AuthoredEdit[] = [];
  for (const selected of decision.selection.changes) {
    const change = readRecord(state.changes, selected.id);
    if (!change) throw new Error('Missing authored decision selection.');
    if (change.status === (accepting ? 'accepted' : 'rejected')) continue;
    for (const [, operationId] of records(change.operations)) {
      const operation = readRecord(state.operations, operationId);
      if (!operation || !hasAuthoredContent(operation)) {
        throw new Error('Missing authored contribution.');
      }
      operations.push(materializeAuthoredEdit(operation));
    }
  }
  operations.sort(
    (left, right) =>
      (left.clock - right.clock || left.id.localeCompare(right.id)) *
      (accepting ? 1 : -1)
  );
  return projectAuthoredSteps({
    editor: input.editor,
    projection,
    schema,
    state,
    steps: operations.map((operation) => ({
      operation,
      direction: accepting ? 'forward' : 'inverse',
      target: accepting ? 'accepted' : 'projected',
    })),
  });
};

export const projectAuthoredSteps = (input: {
  editor?: Editor;
  previous?: AuthoredState;
  projection: AuthoredProjection;
  projectionOnly?: boolean;
  schema?: InternalEditorSchemaApi;
  state: AuthoredState;
  restoreAcceptedCounterparts?: boolean;
  steps: ReadonlyArray<
    Readonly<{
      operation: AuthoredEdit;
      direction: 'forward' | 'inverse';
      target: 'accepted' | 'projected';
    }>
  >;
}) => {
  const documentSteps = input.steps.some(({ operation }) => operation.retained)
    ? input.steps.filter(({ operation }) => !operation.retained)
    : input.steps;
  const { projection, schema, state } = input;
  const compiledSchema = schema ? getCompiledEditorSchemaFromApi(schema) : null;
  const accepted = new ChangeDraft(projection.accepted, {
    trackChanges: !input.projectionOnly,
  });
  const projected = new ChangeDraft(projection.projected, {
    trackChanges: !input.projectionOnly,
  });
  let { acceptedPositions } = projection;
  let { projectedPositions } = projection;
  const propertyVisibility = {
    accepted: new Map<string, boolean>(),
    projected: new Map<string, boolean>(),
  };
  for (const step of documentSteps) {
    propertyVisibility[step.target].set(
      step.operation.id,
      step.direction === 'forward'
    );
  }
  const mapStep = (
    { operation, direction, target }: (typeof input.steps)[number],
    positions: AuthoredPositionRoots,
    value: JsonEditorValue
  ) => {
    const mappingState =
      direction === 'inverse' ? (input.previous ?? state) : state;
    return mapAuthoredChange({
      deferTextProperties: true,
      state: mappingState,
      properties: {
        editor: input.editor,
        state,
        schema: compiledSchema,
        isVisible: (edit) =>
          propertyVisibility[target].get(edit.id) ??
          (target === 'accepted'
            ? readRecord(state.changes, edit.changeId)?.status === 'accepted'
            : readRecord(state.changes, edit.changeId)?.status !== 'rejected'),
        refuseCausalOverwrite:
          target === 'accepted' &&
          operation.proposal &&
          direction === 'forward' &&
          readRecord(state.changes, operation.changeId)?.status !== 'accepted',
      },
      acceptedEdit: !operation.proposal && direction === 'forward',
      accepted:
        target === 'projected' && input.restoreAcceptedCounterparts !== false
          ? {
              isAccepted: (identity) =>
                readRecord(mappingState.changes, identity)?.status ===
                'accepted',
              positions: acceptedPositions,
              value: accepted.value,
            }
          : undefined,
      changeId: operation.changeId,
      direction,
      operationId: operation.id,
      positions,
      steps: operation.steps,
      value,
    });
  };
  const projectProperties = hasAuthoredPropertyProjection(state);
  // Custom validators can observe each replayed step through their closure.
  const batchText =
    input.projectionOnly &&
    !projectProperties &&
    ![...(compiledSchema?.properties.byId.values() ?? [])].some((property) =>
      hasCustomValidation(property.descriptor)
    );
  const applyTextBatch = (start: number): number => {
    const roots = new Map<
      string,
      {
        document: DocumentIndex;
        insertions: Array<{
          at: number;
          replacement: NonNullable<RootChangeJson[number]['replacement']>;
          spans: readonly AuthoredSpan[];
        }>;
      }
    >();
    const paths = new Set<string>();
    const changes = new Set<string>();
    let end = start;
    for (; end < documentSteps.length; end++) {
      const entry = documentSteps[end];
      const { operation } = entry;
      const frame = operation.steps[0];
      const target = frame?.targets[0];
      if (
        entry.direction !== 'forward' ||
        entry.target !== 'projected' ||
        !operation.proposal ||
        operation.inverseOf ||
        operation.dependencies.length ||
        changes.has(operation.changeId) ||
        readRecord(state.changes, operation.changeId)?.status !== 'pending' ||
        operation.steps.length !== 1 ||
        frame.targets.length !== 1 ||
        frame.rootTargets.length ||
        frame.forward.createRoots?.length ||
        frame.forward.deleteRoots?.length ||
        !target ||
        target.removed.length ||
        target.retained ||
        target.inserted.length !== 1
      ) {
        break;
      }
      const span = target.inserted[0];
      const sections =
        target.root === 'main'
          ? frame.forward.primary
          : frame.forward.roots?.[target.root];
      const section = sections?.[target.section];
      if (
        span.birth !== operation.changeId ||
        span.origin !== authoredOperationOrigin(operation.id, target.root) ||
        span.offset !== 0 ||
        span.placement !== null ||
        Object.keys(span.properties).length ||
        !section?.replacement?.length ||
        section.length !== 0 ||
        section.properties ||
        !section.replacement.every((token) => token.kind === 'text') ||
        sections?.some(
          (current, index) =>
            index !== target.section &&
            (current.replacement !== undefined || current.properties)
        )
      ) {
        break;
      }
      const root = readRecord(projectedPositions, target.root);
      if (!root?.present) break;
      const at = resolveAuthoredPosition(root.positions, target.from);
      // An anchor into another proposal must wait for that proposal's replay.
      if (
        at === null ||
        !jsonEqual(target.from, target.to) ||
        !jsonEqual(target.from, authoredPositionAt(root.positions, at))
      ) {
        break;
      }
      let batch = roots.get(target.root);
      if (!batch) {
        batch = {
          document: DocumentIndex.fromValue(
            authoredRootNodes(projected.value, target.root)
          ),
          insertions: [],
        };
        roots.set(target.root, batch);
      }
      const text = batch.document.textAt(at);
      if (!text || at < text.contentFrom || at > text.contentTo) break;
      const path = JSON.stringify([target.root, text.path]);
      if (paths.has(path)) break;
      const mapped = mapStep(entry, projectedPositions, projected.value);
      const entries = [...getInternalDocumentChangeEntries(mapped.change)];
      const first = entries[0];
      if (!first) break;
      const [mappedRoot, change] = first;
      const mappedSections = change.toJSON();
      let offset = 0;
      const replacements = mappedSections.flatMap((current) => {
        const from = offset;
        offset += current.length;
        return current.replacement
          ? [{ from, to: offset, insert: current.replacement }]
          : [];
      });
      const replacement = replacements[0];
      if (
        entries.length !== 1 ||
        mappedRoot !== target.root ||
        replacements.length !== 1 ||
        !replacement ||
        replacement.from !== at ||
        replacement.to !== at ||
        !replacement.insert.every((token) => token.kind === 'text') ||
        mappedSections.some((current) => current.properties) ||
        mapped.change.createRoots.size ||
        mapped.change.deleteRoots.size
      ) {
        break;
      }
      batch.insertions.push({
        at,
        replacement: replacement.insert,
        spans: target.inserted,
      });
      paths.add(path);
      changes.add(operation.changeId);
    }
    if (end - start < 2) return start;
    const encoded: Record<string, RootChangeJson> = {};
    let positions = projectedPositions;
    for (const [key, batch] of roots) {
      if (!batch.insertions.length) continue;
      batch.insertions.sort((left, right) => left.at - right.at);
      const sections: Array<RootChangeJson[number]> = [];
      let from = 0;
      for (const insertion of batch.insertions) {
        if (insertion.at > from) sections.push({ length: insertion.at - from });
        sections.push({ length: 0, replacement: insertion.replacement });
        from = insertion.at;
      }
      if (from < batch.document.length) {
        sections.push({ length: batch.document.length - from });
      }
      encoded[key] = sections;
      const root = getDefined(readRecord(positions, key));
      const next = insertAuthoredPositionBatch(
        root.positions,
        batch.insertions
      );
      positions = writeRecord(positions, key, { ...root, positions: next });
    }
    const { main, ...named } = encoded;
    const change = DocumentChange.fromJSON({
      version: 3,
      ...(main ? { primary: main } : {}),
      ...(Object.keys(named).length ? { roots: named } : {}),
    });
    const applied = projected.apply(change);
    schema?.validateDocumentChange({
      before: applied.before as EditorDocumentValue,
      after: applied.after as EditorDocumentValue,
      change,
      indexedBefore: applied.indexedBefore,
      indexedAfter: applied.indexedAfter,
    });
    projectedPositions = positions;
    return end;
  };
  for (let index = 0; index < documentSteps.length;) {
    const end = batchText ? applyTextBatch(index) : index;
    if (end > index) {
      index = end;
      continue;
    }
    const entry = documentSteps[index];
    index += 1;
    const { target } = entry;
    const draft = target === 'accepted' ? accepted : projected;
    const step = mapStep(
      entry,
      target === 'accepted' ? acceptedPositions : projectedPositions,
      draft.value
    );
    const applied = draft.apply(step.change);
    schema?.validateDocumentChange({
      before: applied.before as EditorDocumentValue,
      after: applied.after as EditorDocumentValue,
      change: step.change,
      indexedBefore: applied.indexedBefore,
      indexedAfter: applied.indexedAfter,
    });
    if (target === 'accepted') acceptedPositions = step.positions;
    else projectedPositions = step.positions;
  }
  for (const target of ['accepted', 'projected'] as const) {
    // Decision replay can expose adjacent text or an empty inline even without
    // property writes, so representation repair must stay in the decision batch.
    if (!projectProperties && !input.editor) continue;
    const steps = documentSteps.filter((step) => step.target === target);
    const last = steps.at(-1);
    if (!last) continue;
    const draft = target === 'accepted' ? accepted : projected;
    const before = (
      target === 'accepted' ? projection.accepted : projection.projected
    ) as JsonEditorValue;
    const mapped = projectAuthoredTextProperties({
      before,
      change: input.projectionOnly
        ? DocumentChange.between(before, draft.value)
        : draft.change,
      changeId: last.operation.changeId,
      operationId: last.operation.id,
      positions: target === 'accepted' ? acceptedPositions : projectedPositions,
      properties: {
        editor: input.editor,
        state,
        schema: compiledSchema,
        isVisible: (edit) =>
          propertyVisibility[target].get(edit.id) ??
          (target === 'accepted'
            ? readRecord(state.changes, edit.changeId)?.status === 'accepted'
            : readRecord(state.changes, edit.changeId)?.status !== 'rejected'),
      },
      steps: projectProperties
        ? steps.flatMap((step) =>
            authoredOperationPropertySteps(state, step.operation)
          )
        : [],
      value: draft.value,
    });
    const applied = draft.apply(mapped.change);
    schema?.validateDocumentChange({
      before: applied.before as EditorDocumentValue,
      after: applied.after as EditorDocumentValue,
      change: mapped.change,
      indexedBefore: applied.indexedBefore,
      indexedAfter: applied.indexedAfter,
    });
    if (target === 'accepted') acceptedPositions = mapped.positions;
    else projectedPositions = mapped.positions;
  }
  return {
    acceptedChange: accepted.change,
    projectedChange: projected.change,
    projection: {
      accepted: accepted.value as EditorDocumentValue,
      acceptedPositions,
      projected: projected.value as EditorDocumentValue,
      projectedPositions,
    },
  };
};

export const projectAuthoredOperation = (input: {
  editor?: Editor;
  operation: AuthoredOperation;
  previous: AuthoredState;
  projection: AuthoredProjection;
  schema: InternalEditorSchemaApi;
  state: AuthoredState;
}) => {
  const { operation, previous, state } = input;
  const component = reviewComponent(
    state,
    operation.kind === 'edit'
      ? [operation.changeId]
      : operation.selection.changes.map(({ id }) => id)
  );
  const steps: Array<
    Parameters<typeof projectAuthoredSteps>[0]['steps'][number]
  > = [];
  const visible = (
    record: AuthoredRecord | null,
    target: 'accepted' | 'projected'
  ) =>
    !!record &&
    (target === 'accepted'
      ? record.status === 'accepted'
      : record.status !== 'rejected');
  for (const target of ['accepted', 'projected'] as const) {
    const removals: AuthoredEdit[] = [];
    const additions: AuthoredEdit[] = [];
    for (const id of component) {
      const before = readRecord(previous.changes, id);
      const after = readRecord(state.changes, id);
      const wasVisible = visible(before, target);
      const isVisible = visible(after, target);
      if (wasVisible === isVisible) {
        if (
          isVisible &&
          hasAuthoredContent(operation) &&
          id === operation.changeId
        ) {
          additions.push(materializeAuthoredEdit(operation));
        }
        continue;
      }
      for (const [, identity] of records(
        (wasVisible ? before : after)?.operations ?? null
      )) {
        const edit = readRecord(state.operations, identity);
        if (!edit || !hasAuthoredContent(edit)) {
          throw new Error('Missing authored contribution.');
        }
        (wasVisible ? removals : additions).push(materializeAuthoredEdit(edit));
      }
    }
    removals.sort(
      (left, right) =>
        right.clock - left.clock || right.id.localeCompare(left.id)
    );
    additions.sort(
      (left, right) =>
        left.clock - right.clock || left.id.localeCompare(right.id)
    );
    steps.push(
      ...removals.map((edit) => ({
        operation: edit,
        direction: 'inverse' as const,
        target,
      })),
      ...additions.map((edit) => ({
        operation: edit,
        direction: 'forward' as const,
        target,
      }))
    );
  }
  return projectAuthoredSteps({ ...input, steps });
};

export const prepareAuthoredRevert = (input: {
  editor?: Editor;
  selection: AuthoredSelection;
  projection: AuthoredProjection;
  schema: InternalEditorSchemaApi;
  state: AuthoredState;
  target: 'accepted' | 'projected';
}) => {
  const inspected = inspectAuthoredSelection(input.state, input.selection);
  if (inspected.status !== 'ready') return inspected;
  const { ids, changes } = inspected;
  const selected = new Set(ids);
  const conflicts = changes
    .filter((change) => change.status !== 'accepted')
    .map((change) => change.id);
  const dependants = new Set<string>();
  const visited = new Set<string>();
  const queue = [...ids];
  for (const identity of queue) {
    if (visited.has(identity)) continue;
    visited.add(identity);
    for (const child of authoredDependants(input.state, identity)) {
      if (child.status === 'rejected') continue;
      if (!selected.has(child.id)) dependants.add(child.id);
      queue.push(child.id);
    }
  }
  if (conflicts.length || dependants.size) {
    return snapshotEditorJsonValue(
      {
        status: 'blocked' as const,
        ids,
        conflicts,
        dependencies: [],
        dependants: [...dependants].sort(),
      },
      'Authored revert result'
    );
  }
  const operations: AuthoredEdit[] = [];
  for (const change of changes) {
    for (const [, operationId] of records(change.operations)) {
      const operation = readRecord(input.state.operations, operationId);
      if (!operation || !hasAuthoredContent(operation)) {
        throw new Error('Missing authored retained content.');
      }
      operations.push(materializeAuthoredEdit(operation));
    }
  }
  operations.sort(
    (left, right) => right.clock - left.clock || right.id.localeCompare(left.id)
  );
  try {
    const projected = projectAuthoredSteps({
      ...input,
      restoreAcceptedCounterparts: false,
      steps: operations.map((operation) => ({
        operation,
        direction: 'inverse',
        target: input.target,
      })),
    });
    return {
      status: 'ready' as const,
      change:
        input.target === 'accepted'
          ? projected.acceptedChange
          : projected.projectedChange,
      positions:
        input.target === 'accepted'
          ? projected.projection.acceptedPositions
          : projected.projection.projectedPositions,
    };
  } catch (error) {
    if (
      !(error instanceof AuthoredMappingConflictError) &&
      !(error instanceof EditorSchemaValidationError)
    ) {
      throw error;
    }
    return snapshotEditorJsonValue(
      {
        status: 'blocked' as const,
        ids,
        dependencies: [],
        dependants: [],
        conflicts:
          error instanceof AuthoredMappingConflictError
            ? [...new Set(error.identities)].sort()
            : ids,
      },
      'Authored revert result'
    );
  }
};

export const projectAuthoredReviewUndo = (input: {
  editor?: Editor;
  operation: AuthoredReview;
  projection: AuthoredProjection;
  schema?: InternalEditorSchemaApi;
  state: AuthoredState;
}) => {
  const { operation, state } = input;
  const steps: Array<
    Parameters<typeof projectAuthoredSteps>[0]['steps'][number]
  > = [];
  const selected = new Set(
    operation.selection.changes.map((change) => change.id)
  );
  for (const identity of selected) {
    const change = readRecord(state.changes, identity);
    if (!change) throw new AuthoredMappingConflictError([identity]);
    if (change.heads.length !== 1 || change.heads[0] !== operation.id) {
      // Redo can follow balanced undo/redo edits to the proposal itself.
      const unchangedCompensation =
        operation.kind === 'undo' &&
        change.heads.every((id) => {
          const head = readRecord(state.operations, id);
          return (
            head?.kind === 'edit' &&
            head.inverseOf &&
            head.authorId === operation.authorId &&
            observesAuthoredOperation(head, operation)
          );
        }) &&
        [...records(change.reviews)].every(([, id]) => {
          const review = getDefined(readRecord(state.operations, id));
          return (
            id === operation.id || observesAuthoredOperation(operation, review)
          );
        }) &&
        [...records(change.operations)].every(([, id]) => {
          const edit = getDefined(readRecord(state.operations, id));
          return (
            edit.kind !== 'edit' ||
            edit.inverseOf ||
            isAuthoredEditVisible(state, edit, () => true) ===
              isAuthoredEditVisible(state, edit, (entry) =>
                observesAuthoredOperation(operation, entry)
              )
          );
        });

      if (!unchangedCompensation) {
        throw new AuthoredMappingConflictError([identity]);
      }
    }
    const desired = authoredStatusBeforeReview(state, operation, identity);
    if (change.status === desired) continue;
    if (change.status === 'accepted' && desired === 'pending') {
      const dependants = [...authoredDependants(state, identity)].filter(
        (child) =>
          child.status === 'accepted' &&
          !selected.has(child.id) &&
          [...records(child.operations)].some(([, id]) => {
            const edit = readRecord(state.operations, id);

            return (
              edit?.kind === 'edit' &&
              !edit.inverseOf &&
              isAuthoredEditVisible(
                state,
                edit,
                (contribution) =>
                  readRecord(state.changes, contribution.changeId)?.status ===
                  'accepted'
              )
            );
          })
      );
      if (dependants.length) {
        throw new AuthoredMappingConflictError(
          dependants.map((child) => child.id)
        );
      }
    }
    const target =
      change.status === 'accepted' || desired === 'accepted'
        ? 'accepted'
        : 'projected';
    const direction =
      desired === 'accepted' || change.status === 'rejected'
        ? 'forward'
        : 'inverse';
    if (
      change.status === 'conflicted' ||
      desired === 'conflicted' ||
      (change.status !== 'pending' && desired !== 'pending')
    ) {
      throw new AuthoredMappingConflictError([identity]);
    }
    for (const [, operationId] of records(change.operations)) {
      const edit = readRecord(state.operations, operationId);
      if (!edit || !hasAuthoredContent(edit)) {
        throw new Error('Missing authored contribution.');
      }
      steps.push({
        operation: materializeAuthoredEdit(edit),
        direction,
        target,
      });
    }
  }
  steps.sort((left, right) =>
    left.direction !== right.direction
      ? left.direction === 'inverse'
        ? -1
        : 1
      : (left.operation.clock - right.operation.clock ||
          left.operation.id.localeCompare(right.operation.id)) *
        (left.direction === 'forward' ? 1 : -1)
  );
  return projectAuthoredSteps({ ...input, steps });
};

export const prepareAuthoredDecision = (
  input: Parameters<typeof projectAuthoredDecision>[0]
) => {
  try {
    return { status: 'ready' as const, ...projectAuthoredDecision(input) };
  } catch (error) {
    if (
      !(error instanceof AuthoredMappingConflictError) &&
      !(error instanceof EditorSchemaValidationError)
    ) {
      throw error;
    }
    const ids = input.decision.selection.changes
      .map((change) => change.id)
      .sort();
    return snapshotEditorJsonValue(
      {
        status: 'blocked' as const,
        dependencies: [],
        dependants: [],
        conflicts:
          error instanceof AuthoredMappingConflictError
            ? [...new Set(error.identities)].sort()
            : ids,
        ids,
      },
      'Authored decision result'
    );
  }
};
