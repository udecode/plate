import type { LetterPlace } from '../core/change/carried-projection';
import type { CarriedRun } from '../core/change/carried-run';
import {
  bindV4DocumentChange,
  copyV4StepsMetadata,
  createV4DocumentChange,
  DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys,
  getInternalDocumentRootChange,
  getV4RegisterSteps,
  getV4Steps,
  isExternalRootChangeOrigin,
  valueRoot,
  valueRootIndex,
  withInternalDocumentRootChange,
} from '../core/change/document-change';
import type { DocumentIndex } from '../core/change/document-index';
import { jsonEqual, type JsonRecord } from '../core/change/json';
import { visitRootNames } from '../core/change/lazy-root';
import { hasInternalDocumentChangeStepFirstAt } from '../core/change/replay-step-order';
import {
  type DocumentSetPropertyResolver,
  keptRunsOf,
  RootChange,
} from '../core/change/root-change';
import {
  isElementNode,
  isTextNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
  type JsonPoint,
  type JsonToken,
  tokensEqual,
} from '../core/change/tokens';
import {
  applyV4Steps,
  elementStreamLength,
  isTextBearingElement,
  toV4TextStream,
} from '../core/change/v4/apply';
import { extractV4Between } from '../core/change/v4/extract';
import { getValueIdLookup } from '../core/change/v4/lower';
import { rebaseV4Changes } from '../core/change/v4/rebase';
import type {
  V4Place,
  V4PropDelta,
  V4RegisterStep,
  V4Step,
} from '../core/change/v4/types';
import { parseScopedElementId } from '../core/reserved-element-id';
import { mapSelectionThroughChange } from '../core/selection-protocol';
import type {
  AnyEditor,
  EditorDocumentValue,
  NodeKey,
} from '../interfaces/editor';
import { SelectionApi, type Selection } from '../interfaces/selection';

const collectElementIds = (
  nodes: readonly JsonNode[],
  into: Set<string>
): boolean => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    if (typeof node.id !== 'string' || node.id.length === 0) return false;
    into.add(node.id);
    if (!collectElementIds(node.children, into)) return false;
  }

  return true;
};

export const collectLiveElementIds = (
  value: JsonEditorValue
): Set<string> | null => {
  const ids = new Set<string>();

  if (!collectElementIds(value.children, ids)) return null;
  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      if (!collectElementIds(value.roots[root], ids)) return null;
    }
  }

  return ids;
};

const collectSubtreeIds = (node: JsonNode, into: Set<string>) => {
  if (!isElementNode(node)) return;
  if (typeof node.id === 'string' && node.id.length > 0) into.add(node.id);
  for (const child of node.children) collectSubtreeIds(child, into);
};

const indexElements = (
  value: JsonEditorValue
): Map<string, JsonElementNode> => {
  const map = new Map<string, JsonElementNode>();
  const walk = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (typeof node.id === 'string' && node.id.length > 0) {
        map.set(node.id, node);
      }
      walk(node.children);
    }
  };

  walk(value.children);
  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      walk(value.roots[root]);
    }
  }

  return map;
};

const stepMutatedIds = (step: V4Step): readonly string[] => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      return [step.target];
    }
    case 'unwrap_inline': {
      return [step.parent, step.id];
    }
    case 'set_props':
    case 'split_node': {
      return [step.id];
    }
    case 'join_nodes': {
      return [step.target, step.source];
    }
    case 'insert_node': {
      return 'id' in step.to ? [step.to.id] : [];
    }
    default: {
      return [];
    }
  }
};

const filterUntouchedMovesForRemovedIds = (
  base: JsonEditorValue,
  stepDocSteps: readonly V4Step[],
  editDocSteps: readonly V4Step[]
): readonly V4Step[] => {
  const removedIds = new Set<string>();

  for (const step of stepDocSteps) {
    if (step.op === 'remove_node') removedIds.add(step.id);
  }
  if (removedIds.size === 0) return editDocSteps;

  const movedRemovedIds = new Set<string>();

  for (const step of editDocSteps) {
    if (step.op === 'move_node' && removedIds.has(step.id)) {
      movedRemovedIds.add(step.id);
    }
  }
  if (movedRemovedIds.size === 0) return editDocSteps;

  const byId = indexElements(base);
  const droppable = new Set<string>();

  for (const movedId of movedRemovedIds) {
    const node = byId.get(movedId);
    const subtree = new Set<string>([movedId]);

    if (node) collectSubtreeIds(node, subtree);

    let blocked = false;

    for (const step of stepDocSteps) {
      if (
        step.op === 'move_node' &&
        step.id !== movedId &&
        subtree.has(step.id) &&
        !removedIds.has(step.id)
      ) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    for (const step of editDocSteps) {
      if (step.op === 'move_node' && step.id === movedId) continue;
      for (const mutated of stepMutatedIds(step)) {
        if (subtree.has(mutated)) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
      if (
        step.op === 'move_node' &&
        'id' in step.to &&
        subtree.has(step.to.id)
      ) {
        blocked = true;
        break;
      }
    }
    if (!blocked) droppable.add(movedId);
  }

  if (droppable.size === 0) return editDocSteps;

  return editDocSteps.filter(
    (step) => !(step.op === 'move_node' && droppable.has(step.id))
  );
};

export type V4HistoryRebaseResult = Readonly<{
  a: DocumentChange;
  b: DocumentChange;
}>;

const rebindChangeNodeKeys = (
  target: DocumentChange,
  source: DocumentChange
): DocumentChange => {
  const elementKeys = new Map<string, NodeKey>();
  const textKeysByParent = new Map<string, NodeKey[]>();

  for (const [, rootChange] of getInternalDocumentChangeEntries(source)) {
    rootChange.collectInsertedNodeKeys(elementKeys, textKeysByParent);
  }
  if (elementKeys.size === 0 && textKeysByParent.size === 0) return target;

  let result = target;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(target)) {
    const rebound = rootChange.applyNodeKeysById(elementKeys, textKeysByParent);

    if (rebound !== rootChange) {
      result = withInternalDocumentRootChange(result, root, rebound);
    }
  }

  if (result !== target) {
    copyV4StepsMetadata(target, result);
  }

  return result;
};

const hasRootLifecycleConflict = (
  edit: DocumentChange,
  step: DocumentChange
): boolean => {
  if (
    edit.createRoots.size === 0 &&
    edit.deleteRoots.size === 0 &&
    step.createRoots.size === 0 &&
    step.deleteRoots.size === 0
  ) {
    return false;
  }

  const editRoots = new Set([
    ...edit.createRoots,
    ...edit.deleteRoots,
    ...getInternalDocumentChangeRootKeys(edit),
  ]);
  const stepRoots = new Set([
    ...step.createRoots,
    ...step.deleteRoots,
    ...getInternalDocumentChangeRootKeys(step),
  ]);

  for (const root of [...edit.createRoots, ...edit.deleteRoots]) {
    if (stepRoots.has(root)) return true;
  }
  for (const root of [...step.createRoots, ...step.deleteRoots]) {
    if (editRoots.has(root)) return true;
  }

  return false;
};

const wrapsAcrossPeerSplit = (
  editDocSteps: readonly V4Step[],
  stepDocSteps: readonly V4Step[]
): boolean => {
  const splitIds = new Set<string>();

  for (const step of editDocSteps) {
    if (step.op === 'split_node') splitIds.add(step.id);
  }
  if (splitIds.size === 0) return false;

  const insertedWrappers = new Set<string>();

  for (const step of stepDocSteps) {
    if (
      step.op === 'insert_node' &&
      'id' in step.to &&
      splitIds.has(step.to.id) &&
      typeof step.node.id === 'string'
    ) {
      insertedWrappers.add(step.node.id);
    }
  }
  if (insertedWrappers.size === 0) return false;

  let movedIntoWrapper = 0;

  for (const step of stepDocSteps) {
    if (
      step.op === 'move_node' &&
      'id' in step.to &&
      insertedWrappers.has(step.to.id)
    ) {
      movedIntoWrapper += 1;
    }
  }

  return movedIntoWrapper >= 2;
};

const isAuthoredMarkKey = (key: string): boolean => key.startsWith('authored');

const isUserFormatStep = (step: V4Step): boolean => {
  if (step.op !== 'format_text') return false;
  if (step.set && Object.keys(step.set).some(isAuthoredMarkKey)) return false;
  if (step.unset && step.unset.some(isAuthoredMarkKey)) return false;
  if (step.add && Object.keys(step.add).some(isAuthoredMarkKey)) return false;
  if (step.remove && Object.keys(step.remove).some(isAuthoredMarkKey)) {
    return false;
  }

  return true;
};

export const isPureV4FormatChange = (
  base: JsonEditorValue,
  change: DocumentChange,
  after: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver,
  allowAuthored = false
): boolean => {
  if (change.empty) return false;

  let steps = getV4Steps(change);

  if (!steps) {
    try {
      steps = extractV4Between(base, after, { isSetValued });
    } catch {
      return false;
    }
  }

  return (
    steps.length > 0 &&
    steps.every((step) =>
      allowAuthored ? step.op === 'format_text' : isUserFormatStep(step)
    )
  );
};

const tryRelocatedTextDeleteRebase = (
  base: JsonEditorValue,
  editDocSteps: readonly V4Step[],
  stepDocSteps: readonly V4Step[],
  editAfter: JsonEditorValue,
  stepAfter: JsonEditorValue
): Readonly<{
  editDoc: readonly V4Step[];
  stepDoc: readonly V4Step[];
}> | null => {
  let targetDel: Extract<V4Step, { op: 'delete_text' }> | null = null;

  for (const s of stepDocSteps) {
    if (s.op === 'delete_text') {
      if (targetDel !== null) return null;
      targetDel = s;
    } else if (s.op !== 'format_text') {
      return null;
    }
  }
  if (!targetDel) return null;
  for (const s of stepDocSteps) {
    if (
      s.op === 'format_text' &&
      (s.target !== targetDel.target ||
        s.offset < targetDel.offset ||
        s.offset + s.length > targetDel.offset + targetDel.length)
    ) {
      return null;
    }
  }
  const delIdx = editDocSteps.findIndex(
    (s) =>
      s.op === 'delete_text' &&
      s.target === targetDel.target &&
      s.offset === targetDel.offset &&
      s.length === targetDel.length
  );

  if (delIdx === -1) return null;

  const baseHost = indexElements(base).get(targetDel.target);

  if (!baseHost || !isTextBearingElement(baseHost)) return null;

  const units = toV4TextStream(baseHost.children).units.slice(
    targetDel.offset,
    targetDel.offset + targetDel.length
  );

  if (
    units.length !== targetDel.length ||
    units.some((u) => u.kind !== 'char')
  ) {
    return null;
  }

  const firstMarks = units[0]?.kind === 'char' ? units[0].marks : {};

  if (
    !units.every((u) => u.kind === 'char' && jsonEqual(u.marks, firstMarks))
  ) {
    return null;
  }

  const deletedText = units
    .map((u) => (u.kind === 'char' ? u.ch : ''))
    .join('');

  let insIdx = editDocSteps.findIndex(
    (s, i) =>
      i !== delIdx &&
      s.op === 'insert_text' &&
      s.text === deletedText &&
      jsonEqual(s.marks ?? {}, firstMarks) &&
      (s.target !== targetDel.target || s.offset !== targetDel.offset)
  );
  let companionFmtIdx = -1;

  if (insIdx === -1) {
    for (let i = 0; i < editDocSteps.length; i += 1) {
      if (i === delIdx) continue;
      const s = editDocSteps[i];

      if (
        s?.op !== 'insert_text' ||
        s.text !== deletedText ||
        (s.target === targetDel.target && s.offset === targetDel.offset)
      ) {
        continue;
      }
      const nextStep = editDocSteps[i + 1];

      if (
        nextStep?.op === 'format_text' &&
        nextStep.target === s.target &&
        nextStep.offset === s.offset &&
        nextStep.length === s.text.length &&
        jsonEqual({ ...s.marks, ...nextStep.set }, firstMarks)
      ) {
        insIdx = i;
        companionFmtIdx = i + 1;
        break;
      }
    }
  }

  if (insIdx === -1) return null;

  const insStep = editDocSteps[insIdx];

  if (insStep?.op !== 'insert_text') return null;

  const destTarget = insStep.target;
  let destOffset = insStep.offset;

  for (
    let i = Math.max(insIdx, companionFmtIdx) + 1;
    i < editDocSteps.length;
    i += 1
  ) {
    const later = editDocSteps[i];

    if (!later) continue;
    if (later.op === 'insert_text' && later.target === destTarget) {
      if (later.offset <= destOffset) destOffset += later.text.length;
    } else if (later.op === 'delete_text' && later.target === destTarget) {
      if (later.offset + later.length <= destOffset) {
        destOffset -= later.length;
      } else if (later.offset < destOffset + targetDel.length) {
        return null;
      }
    } else if (
      later.op === 'split_node' ||
      later.op === 'join_nodes' ||
      later.op === 'remove_node'
    ) {
      return null;
    }
  }

  const nextStepDoc: readonly V4Step[] = [
    {
      length: targetDel.length,
      offset: destOffset,
      op: 'delete_text',
      target: destTarget,
    },
  ];
  const nextEditDoc = editDocSteps.filter(
    (_, i) => i !== delIdx && i !== insIdx && i !== companionFmtIdx
  );

  try {
    const viaEdit = applyV4Steps(editAfter, nextStepDoc);
    const viaStep = applyV4Steps(stepAfter, nextEditDoc);

    if (
      !jsonEqual(viaEdit.children, viaStep.children) ||
      !jsonEqual(viaEdit.roots ?? {}, viaStep.roots ?? {})
    ) {
      return null;
    }

    return { editDoc: nextEditDoc, stepDoc: nextStepDoc };
  } catch {
    return null;
  }
};

const rightAfterPlace = (
  doc: JsonEditorValue,
  targetId: string,
  sourceId: string
): V4Place | null => {
  const targetLoc = locateElementById(doc, targetId);
  const sourceLoc = locateElementById(doc, sourceId);

  if (!targetLoc || !sourceLoc || targetLoc.root !== sourceLoc.root) {
    return null;
  }

  const targetParentPath = targetLoc.path.slice(0, -1);
  const sourceParentPath = sourceLoc.path.slice(0, -1);
  const targetIdx = targetLoc.path.at(-1);
  const sourceIdx = sourceLoc.path.at(-1);

  if (targetIdx === undefined || sourceIdx === undefined) return null;

  const sameParent =
    targetParentPath.length === sourceParentPath.length &&
    targetParentPath.every((n, i) => n === sourceParentPath[i]);

  if (sameParent && sourceIdx === targetIdx + 1) return null;

  const destIndex =
    sameParent && sourceIdx < targetIdx ? targetIdx : targetIdx + 1;

  if (targetParentPath.length === 0) {
    return { index: destIndex, root: targetLoc.root };
  }

  const parentNode = valueRootIndex(doc, targetLoc.root).node(targetParentPath);

  if (
    !isElementNode(parentNode) ||
    typeof parentNode.id !== 'string' ||
    parentNode.id.length === 0
  ) {
    return null;
  }

  return { id: parentNode.id, index: destIndex };
};

const elementParentIdIn = (doc: JsonEditorValue, id: string): string | null => {
  const loc = locateElementById(doc, id);

  if (!loc || loc.path.length <= 1) return null;

  const parent = valueRootIndex(doc, loc.root).node(loc.path.slice(0, -1));

  return isElementNode(parent) && typeof parent.id === 'string'
    ? parent.id
    : null;
};

const isEmptyTextSubtree = (node: JsonElementNode): boolean =>
  node.children.every((child) =>
    isElementNode(child)
      ? isEmptyTextSubtree(child)
      : typeof child.text === 'string' && child.text.length === 0
  );

const tryRelocatedRestoreOnDeletedTarget = (
  base: JsonEditorValue,
  editDocSteps: readonly V4Step[],
  editAfter: JsonEditorValue,
  stepDocSteps: readonly V4Step[],
  stepAfter: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver
): Readonly<{
  editDoc: readonly V4Step[];
  stepDoc: readonly V4Step[];
}> | null => {
  const editRemoved = new Set<string>();

  for (const s of editDocSteps) {
    if (s.op === 'remove_node') editRemoved.add(s.id);
    else if (s.op !== 'move_node') return null;
  }
  if (editRemoved.size !== 1) return null;

  const [deletedTargetId] = editRemoved;

  if (!deletedTargetId) return null;
  if (
    !stepDocSteps.every(
      (s) =>
        s.op === 'remove_node' ||
        s.op === 'insert_text' ||
        s.op === 'delete_text'
    )
  ) {
    return null;
  }

  const baseById = indexElements(base);
  const targetInStepAfter = indexElements(stepAfter).get(deletedTargetId);

  if (!targetInStepAfter || !isTextBearingElement(targetInStepAfter)) {
    return null;
  }
  const desiredUnits = toV4TextStream(targetInStepAfter.children).units;

  if (
    desiredUnits.length === 0 ||
    !desiredUnits.every((u) => u.kind === 'char')
  ) {
    return null;
  }
  const desiredText = desiredUnits
    .map((u) => (u.kind === 'char' ? u.ch : ''))
    .join('');

  // Find a unique node in editAfter that step removes whose text contains the
  // desired text that step was restoring into deletedTargetId.
  const afterById = indexElements(editAfter);
  let carrierId: string | null = null;
  let carrierText = '';
  let matchIdx = -1;

  for (const s of stepDocSteps) {
    if (s.op !== 'remove_node') continue;
    const node = afterById.get(s.id);

    if (!node || !isTextBearingElement(node)) continue;
    const { units } = toV4TextStream(node.children);

    if (!units.every((u) => u.kind === 'char')) continue;
    const text = units.map((u) => (u.kind === 'char' ? u.ch : '')).join('');
    const idx = text.indexOf(desiredText);

    if (idx !== -1 && text.length > desiredText.length) {
      if (carrierId !== null) return null;
      carrierId = s.id;
      carrierText = text;
      matchIdx = idx;
    }
  }
  if (!carrierId || matchIdx === -1) return null;

  const baseTarget = baseById.get(deletedTargetId);

  if (!baseTarget || !isTextBearingElement(baseTarget)) return null;

  const stepRemoveCount = stepDocSteps.filter(
    (s) => s.op === 'remove_node'
  ).length;
  const stepEditsCarrier = stepDocSteps.some(
    (s) =>
      (s.op === 'delete_text' || s.op === 'insert_text') &&
      s.target === carrierId
  );

  if (stepRemoveCount < 2 && !stepEditsCarrier) return null;

  const nextStepDoc: V4Step[] = [];

  for (const s of stepDocSteps) {
    if (s.op === 'remove_node') {
      if (s.id === carrierId) {
        const suffixStart = matchIdx + desiredText.length;

        if (suffixStart < carrierText.length) {
          nextStepDoc.push({
            length: carrierText.length - suffixStart,
            offset: suffixStart,
            op: 'delete_text',
            target: carrierId,
          });
        }
        if (matchIdx > 0) {
          nextStepDoc.push({
            length: matchIdx,
            offset: 0,
            op: 'delete_text',
            target: carrierId,
          });
        }
      } else if (afterById.has(s.id)) {
        nextStepDoc.push(s);
      }
    } else if (
      s.target !== deletedTargetId &&
      s.target !== carrierId &&
      afterById.has(s.target)
    ) {
      nextStepDoc.push(s);
    }
  }

  try {
    const viaEdit = applyV4Steps(editAfter, nextStepDoc);
    const nextEditDoc = extractV4Between(stepAfter, viaEdit, { isSetValued });
    const viaStep = applyV4Steps(stepAfter, nextEditDoc);

    if (
      !jsonEqual(viaEdit.children, viaStep.children) ||
      !jsonEqual(viaEdit.roots ?? {}, viaStep.roots ?? {})
    ) {
      return null;
    }

    return { editDoc: nextEditDoc, stepDoc: nextStepDoc };
  } catch {
    return null;
  }
};

const tryHistoryEscalationRebase = (
  reason: string,
  base: JsonEditorValue,
  editDocSteps: readonly V4Step[],
  editAfter: JsonEditorValue,
  stepDocSteps: readonly V4Step[],
  stepAfter: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver,
  canRemoveEmptyParent = false
): Readonly<{
  editDoc: readonly V4Step[];
  stepDoc: readonly V4Step[];
}> | null => {
  if (
    reason !== 'not-adjacent' &&
    reason !== 'move-conflict' &&
    reason !== 'target-deleted' &&
    reason !== 'dropped-moves'
  ) {
    return null;
  }

  const baseById = indexElements(base);
  const editInsertedTextTargets = new Set<string>();
  const editRemovedIds = new Set<string>();
  const editInsertedNonEmptyNodeIds = new Set<string>();

  for (const s of editDocSteps) {
    if (s.op === 'insert_text') editInsertedTextTargets.add(s.target);
    else if (s.op === 'remove_node') {
      editRemovedIds.add(s.id);
      const removedNode = baseById.get(s.id);

      if (removedNode) collectSubtreeIds(removedNode, editRemovedIds);
    } else if (
      s.op === 'insert_node' &&
      !isEmptyTextSubtree(s.node) &&
      typeof s.node.id === 'string'
    ) {
      editInsertedNonEmptyNodeIds.add(s.node.id);
    }
  }

  const stepRemovedIds = new Set<string>();

  for (const s of stepDocSteps) {
    if (s.op === 'remove_node') stepRemovedIds.add(s.id);
  }

  const hasUnwrapConflict =
    !stepDocSteps.some((s) => s.op === 'insert_node') &&
    stepDocSteps.some((s) => {
      if (s.op !== 'move_node') return false;
      const oldParent = elementParentIdIn(base, s.id);

      return (
        oldParent !== null &&
        stepRemovedIds.has(oldParent) &&
        elementParentIdIn(editAfter, s.id) !== oldParent
      );
    });

  const simpleEdit = editDocSteps.every(
    (s) =>
      s.op === 'remove_node' ||
      s.op === 'move_node' ||
      s.op === 'insert_text' ||
      s.op === 'delete_text' ||
      s.op === 'format_text' ||
      s.op === 'set_props'
  );
  const preservePeerTextInRemoved =
    (reason === 'target-deleted' || reason === 'not-adjacent') &&
    editInsertedTextTargets.size > 0 &&
    simpleEdit &&
    stepDocSteps.some(
      (s) => s.op === 'remove_node' && editInsertedTextTargets.has(s.id)
    ) &&
    stepDocSteps.every(
      (s) =>
        s.op === 'join_nodes' ||
        s.op === 'remove_node' ||
        s.op === 'delete_text' ||
        s.op === 'format_text'
    );

  if (reason === 'target-deleted') {
    const pureRemoteDelete =
      editDocSteps.length > 0 &&
      editDocSteps.every((s) => s.op === 'remove_node') &&
      stepDocSteps.some(
        (s) => s.op === 'remove_node' && editRemovedIds.has(s.id)
      ) &&
      stepDocSteps.every(
        (s) =>
          s.op === 'remove_node' ||
          s.op === 'insert_text' ||
          s.op === 'delete_text' ||
          s.op === 'format_text'
      );
    const pureRemovalOrDeleteStep =
      editRemovedIds.size > 0 &&
      simpleEdit &&
      stepDocSteps.every((s) => {
        if (
          s.op === 'join_nodes' ||
          s.op === 'remove_node' ||
          s.op === 'delete_text' ||
          s.op === 'format_text' ||
          s.op === 'set_props'
        ) {
          return true;
        }
        if (s.op === 'move_node') {
          const oldParent = elementParentIdIn(base, s.id);

          return oldParent !== null && stepRemovedIds.has(oldParent);
        }

        return false;
      });
    const editOnlyMovesRemovedWrappers =
      editDocSteps.length > 0 &&
      editDocSteps.every(
        (s) => s.op === 'move_node' && stepRemovedIds.has(s.id)
      ) &&
      !stepDocSteps.some((s) => s.op === 'insert_node');

    if (
      !pureRemoteDelete &&
      !pureRemovalOrDeleteStep &&
      !editOnlyMovesRemovedWrappers &&
      !preservePeerTextInRemoved &&
      !hasUnwrapConflict
    ) {
      return null;
    }
  }

  if (reason === 'move-conflict' && !hasUnwrapConflict) return null;

  if (reason === 'not-adjacent') {
    if (!stepDocSteps.some((s) => s.op === 'join_nodes')) return null;
    if (
      editDocSteps.some(
        (s) =>
          s.op !== 'move_node' &&
          s.op !== 'remove_node' &&
          s.op !== 'insert_text' &&
          s.op !== 'delete_text' &&
          s.op !== 'format_text' &&
          s.op !== 'set_props'
      )
    ) {
      return null;
    }
  }

  // Never discard text, newly inserted non-empty blocks, or blocks moved into a
  // wrapper the step removes (unless the moved block is itself removed by step).
  const afterById = indexElements(editAfter);

  for (const id of stepRemovedIds) {
    const afterNode = afterById.get(id);

    if (!afterNode) continue;

    const baseNode = baseById.get(id);
    const baseSub = new Set<string>();

    if (baseNode) collectSubtreeIds(baseNode, baseSub);

    const afterSub = new Set<string>();

    collectSubtreeIds(afterNode, afterSub);
    for (const subId of afterSub) {
      if (
        (editInsertedTextTargets.has(subId) &&
          !(preservePeerTextInRemoved && subId === id)) ||
        editInsertedNonEmptyNodeIds.has(subId)
      ) {
        return null;
      }
      if (!baseSub.has(subId) && !stepRemovedIds.has(subId)) {
        const intruder = afterById.get(subId);

        if (intruder && !isEmptyTextSubtree(intruder)) {
          return null;
        }
      }
    }
  }

  let cur = editAfter;
  const nextStepDoc: V4Step[] = [];
  const removedByStep = new Set<string>();
  const skippedJoinedSourceLen = new Map<string, number>();

  try {
    for (const s of stepDocSteps) {
      const liveIds = indexElements(cur);

      if (s.op === 'move_node') {
        const oldParent = elementParentIdIn(base, s.id);

        if (
          oldParent &&
          stepRemovedIds.has(oldParent) &&
          elementParentIdIn(cur, s.id) !== oldParent
        ) {
          // Concurrent edit already lifted this node out of the wrapper we remove.
          continue;
        }
        if (!liveIds.has(s.id)) {
          if (editRemovedIds.has(s.id)) continue;
          return null;
        }
        cur = applyV4Steps(cur, [s]);
        nextStepDoc.push(s);
        continue;
      }

      if (s.op === 'join_nodes') {
        const hasTarget = liveIds.has(s.target);
        const hasSource = liveIds.has(s.source);

        if (!hasTarget || !hasSource) {
          if (!hasSource && editRemovedIds.has(s.source)) {
            const src = baseById.get(s.source);

            if (src && isEmptyTextSubtree(src)) continue;
            if (src && isTextBearingElement(src) && hasTarget) {
              const srcLen = elementStreamLength(src);
              const targetNode = liveIds.get(s.target);
              const targetLen =
                targetNode && isTextBearingElement(targetNode)
                  ? elementStreamLength(targetNode)
                  : -1;
              const deletesJoinedSuffix = stepDocSteps.some(
                (other) =>
                  other.op === 'delete_text' &&
                  other.target === s.target &&
                  other.offset === targetLen &&
                  other.length === srcLen
              );

              if (deletesJoinedSuffix) {
                skippedJoinedSourceLen.set(s.target, srcLen);
                continue;
              }
            }
          }
          if (stepRemovedIds.has(s.target)) {
            if (!hasTarget && editRemovedIds.has(s.target) && hasSource) {
              const sourceNode = liveIds.get(s.source);
              const sourceSub = new Set<string>();

              if (sourceNode) collectSubtreeIds(sourceNode, sourceSub);
              for (const subId of sourceSub) {
                if (
                  editInsertedTextTargets.has(subId) ||
                  editInsertedNonEmptyNodeIds.has(subId)
                ) {
                  return null;
                }
              }
              const rem: V4Step = { id: s.source, op: 'remove_node' };

              cur = applyV4Steps(cur, [rem]);
              nextStepDoc.push(rem);
              for (const subId of sourceSub) removedByStep.add(subId);
              continue;
            }
            if (!hasSource && editRemovedIds.has(s.source)) {
              continue;
            }
          }
          return null;
        }
        const moveTo = rightAfterPlace(cur, s.target, s.source);

        if (moveTo) {
          const srcParentId = elementParentIdIn(cur, s.source);
          const dstParentId = 'id' in moveTo ? moveTo.id : null;
          const emptiesSrcParent =
            srcParentId !== null &&
            srcParentId !== dstParentId &&
            (liveIds.get(srcParentId)?.children.length ?? 0) === 1;
          const moveStep: V4Step = {
            id: s.source,
            op: 'move_node',
            to: moveTo,
          };

          cur = applyV4Steps(cur, [moveStep]);
          nextStepDoc.push(moveStep);
          cur = applyV4Steps(cur, [s]);
          nextStepDoc.push(s);
          if (emptiesSrcParent && srcParentId) {
            if (!canRemoveEmptyParent) return null;
            const remEmpty: V4Step = { id: srcParentId, op: 'remove_node' };

            cur = applyV4Steps(cur, [remEmpty]);
            nextStepDoc.push(remEmpty);
          }
          continue;
        }
        cur = applyV4Steps(cur, [s]);
        nextStepDoc.push(s);
        continue;
      }

      if (s.op === 'remove_node') {
        if (!liveIds.has(s.id)) {
          if (editRemovedIds.has(s.id) || removedByStep.has(s.id)) continue;
          return null;
        }
        if (preservePeerTextInRemoved && editInsertedTextTargets.has(s.id)) {
          const baseNode = baseById.get(s.id);

          if (!baseNode || !isTextBearingElement(baseNode)) return null;
          const baseLen = elementStreamLength(baseNode);

          if (baseLen > 0) {
            const textDel: V4Step = {
              length: baseLen,
              offset: 0,
              op: 'delete_text',
              target: s.id,
            };
            const targetEdits = editDocSteps.filter(
              (es) =>
                (es.op === 'insert_text' ||
                  es.op === 'delete_text' ||
                  es.op === 'format_text') &&
                es.target === s.id
            );
            const rebased = rebaseV4Changes(base, targetEdits, [textDel]);

            if (!rebased.ok) return null;
            for (const piece of rebased.bPrime) {
              cur = applyV4Steps(cur, [piece]);
              nextStepDoc.push(piece);
            }
          } else {
            // Peer typed into an empty block that undo was removing: join it
            // into a surviving text-bearing sibling so peer text and the step stay.
            const loc = locateElementById(cur, s.id);

            if (!loc) return null;
            const parentNodes =
              loc.path.length === 1
                ? valueRoot(cur, loc.root)
                : (() => {
                    const p = valueRootIndex(cur, loc.root).node(
                      loc.path.slice(0, -1)
                    );

                    return isElementNode(p) ? p.children : [];
                  })();
            const myIdx = loc.path.at(-1) ?? -1;
            const sibling = parentNodes.find(
              (child, idx) =>
                idx !== myIdx &&
                isElementNode(child) &&
                typeof child.id === 'string' &&
                !stepRemovedIds.has(child.id) &&
                isTextBearingElement(child)
            );

            if (
              !sibling ||
              !isElementNode(sibling) ||
              typeof sibling.id !== 'string'
            ) {
              return null;
            }
            const siblingId = sibling.id;
            const joinMove = rightAfterPlace(cur, siblingId, s.id);

            if (joinMove) {
              const mv: V4Step = { id: s.id, op: 'move_node', to: joinMove };

              cur = applyV4Steps(cur, [mv]);
              nextStepDoc.push(mv);
            }
            const jn: V4Step = {
              op: 'join_nodes',
              source: s.id,
              target: siblingId,
            };

            cur = applyV4Steps(cur, [jn]);
            nextStepDoc.push(jn);
          }
          continue;
        }
        const remNode = liveIds.get(s.id);
        const remSub = new Set<string>();

        if (remNode) collectSubtreeIds(remNode, remSub);
        cur = applyV4Steps(cur, [s]);
        nextStepDoc.push(s);
        for (const subId of remSub) removedByStep.add(subId);
        continue;
      }

      if (
        s.op === 'delete_text' &&
        skippedJoinedSourceLen.get(s.target) === s.length
      ) {
        const targetNode = liveIds.get(s.target);

        if (
          targetNode &&
          isTextBearingElement(targetNode) &&
          s.offset === elementStreamLength(targetNode)
        ) {
          skippedJoinedSourceLen.delete(s.target);
          continue;
        }
      }

      if (
        (s.op === 'insert_text' ||
          s.op === 'delete_text' ||
          s.op === 'format_text' ||
          s.op === 'wrap_inline') &&
        !liveIds.has(s.target)
      ) {
        if (editRemovedIds.has(s.target)) continue;
        return null;
      }

      if (
        s.op === 'unwrap_inline' &&
        (!liveIds.has(s.id) || !liveIds.has(s.parent))
      ) {
        if (editRemovedIds.has(s.id) || editRemovedIds.has(s.parent)) continue;
        return null;
      }

      if (
        (s.op === 'set_props' || s.op === 'split_node') &&
        !liveIds.has(s.id)
      ) {
        if (editRemovedIds.has(s.id)) continue;
        return null;
      }

      cur = applyV4Steps(cur, [s]);
      nextStepDoc.push(s);
    }

    const nextEditDoc = extractV4Between(stepAfter, cur, { isSetValued });
    const viaStep = applyV4Steps(stepAfter, nextEditDoc);

    if (
      !jsonEqual(cur.children, viaStep.children) ||
      !jsonEqual(cur.roots ?? {}, viaStep.roots ?? {})
    ) {
      return null;
    }

    return { editDoc: nextEditDoc, stepDoc: nextStepDoc };
  } catch {
    return null;
  }
};

export const tryV4HistoryRebase = (
  base: JsonEditorValue,
  edit: DocumentChange,
  editAfter: JsonEditorValue,
  step: DocumentChange,
  stepAfter: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver,
  exact = false,
  canRemoveEmptyParent = false
): V4HistoryRebaseResult | null => {
  if (hasRootLifecycleConflict(edit, step)) return null;

  const isExternalYjs =
    isExternalRootChangeOrigin(edit) ||
    hasInternalDocumentChangeStepFirstAt(edit);

  if (isExternalYjs) {
    const attachedStepFast = getV4Steps(step);

    if (
      !attachedStepFast ||
      attachedStepFast.length === 0 ||
      !attachedStepFast.every((item) => item.op === 'format_text')
    ) {
      return null;
    }

    if (
      attachedStepFast.every(isUserFormatStep) &&
      getV4RegisterSteps(step).length === 0 &&
      getInternalDocumentChangeRecords(step).size === 0
    ) {
      const roots = [
        ...new Set([
          ...getInternalDocumentChangeRootKeys(edit),
          ...getInternalDocumentChangeRootKeys(step),
        ]),
      ];

      if (roots.length === 1) {
        const root = roots[0];
        const beforeIndex = valueRootIndex(base, root);
        const afterIndex = valueRootIndex(editAfter, root);
        const direct = getInternalDocumentRootChange(edit, root);
        const directRuns = direct
          ? keptRunsOf(direct, 0, afterIndex.length)
          : [];
        const aligned = RootChange.aligned(beforeIndex, afterIndex);
        const alignedRuns = aligned
          ? keptRunsOf(aligned, 0, afterIndex.length)
          : [];
        const findIn = (
          runs: ReadonlyArray<
            Readonly<{ at: number; from: number; to: number }>
          >,
          pos: number
        ): number | null => {
          for (const run of runs) {
            const len = run.to - run.from;

            if (pos >= run.at && pos < run.at + len) {
              return run.from + (pos - run.at);
            }
          }

          return null;
        };
        const mapped = rebaseCarriedFormatViaLetters(
          base,
          step,
          stepAfter,
          {
            letterAt: (pos) =>
              findIn(directRuns, pos) ?? findIn(alignedRuns, pos),
            root,
          },
          DocumentChange.empty,
          edit,
          editAfter,
          isSetValued
        );

        if (mapped) {
          const origTargets = new Set(
            attachedStepFast
              .filter((s): s is V4FormatTextStep => s.op === 'format_text')
              .map((s) => s.target)
          );
          const mappedSteps = getV4Steps(mapped.b) ?? [];
          const movedAcrossElements = mappedSteps.some(
            (s) => s.op === 'format_text' && !origTargets.has(s.target)
          );

          if (movedAcrossElements) return mapped;
        }
      }
    }
  }

  const attachedEdit = getV4Steps(edit);
  const attachedStep = getV4Steps(step);

  if (
    ((!attachedEdit && !edit.empty) || (!attachedStep && !step.empty)) &&
    (!collectLiveElementIds(base) || !collectLiveElementIds(editAfter))
  ) {
    return null;
  }

  let editRawSteps: readonly V4Step[];
  let stepRawSteps: readonly V4Step[];

  try {
    editRawSteps =
      attachedEdit ??
      (edit.empty ? [] : extractV4Between(base, editAfter, { isSetValued }));
    stepRawSteps =
      attachedStep ??
      (step.empty ? [] : extractV4Between(base, stepAfter, { isSetValued }));
  } catch {
    return null;
  }

  const editRegSteps = getV4RegisterSteps(edit);
  const stepRegSteps = getV4RegisterSteps(step);
  const editDocSteps = editRawSteps.filter(
    (item) => item.op !== 'set_register'
  );
  const stepDocSteps = stepRawSteps.filter(
    (item) => item.op !== 'set_register'
  );

  if (
    !edit.empty &&
    editDocSteps.length === 0 &&
    editRegSteps.length === 0 &&
    getInternalDocumentChangeRecords(edit).size === 0
  ) {
    return null;
  }

  if (isExternalYjs && !editDocSteps.every((s) => s.op === 'format_text')) {
    return null;
  }

  // If the incoming mapping is a synthetic same-place same-content ID swap
  // (propagated from a positional fallback on an upper undo step), re-target
  // remove_node(oldId) in the lower step to the replacement node's new id.
  if (editDocSteps.length === 2) {
    const rem = editDocSteps.find((s) => s.op === 'remove_node');
    const ins = editDocSteps.find((s) => s.op === 'insert_node');

    if (
      rem?.op === 'remove_node' &&
      ins?.op === 'insert_node' &&
      typeof ins.node.id === 'string'
    ) {
      const oldNode = indexElements(base).get(rem.id);

      if (
        oldNode &&
        oldNode.type === ins.node.type &&
        jsonEqual(oldNode.children, ins.node.children) &&
        stepDocSteps.some((s) => s.op === 'remove_node' && s.id === rem.id)
      ) {
        const replacementId = ins.node.id;
        const rewrittenStep: V4Step[] = stepDocSteps.map((s) =>
          s.op === 'remove_node' && s.id === rem.id
            ? { id: replacementId, op: 'remove_node' }
            : s
        );

        try {
          const viaEdit = applyV4Steps(editAfter, rewrittenStep);
          const nextEdit = extractV4Between(stepAfter, viaEdit, {
            isSetValued,
          });
          const viaStep = applyV4Steps(stepAfter, nextEdit);

          if (
            jsonEqual(viaEdit.children, viaStep.children) &&
            jsonEqual(viaEdit.roots ?? {}, viaStep.roots ?? {})
          ) {
            const records = {
              first: getInternalDocumentChangeRecords(edit),
              second: getInternalDocumentChangeRecords(step),
            };
            const nextStepSteps: readonly V4Step[] = [
              ...rewrittenStep,
              ...stepRegSteps,
            ];
            const nextEditSteps: readonly V4Step[] = [
              ...nextEdit,
              ...editRegSteps,
            ];
            const b = rebindChangeNodeKeys(
              bindV4DocumentChange(
                createV4DocumentChange(nextStepSteps, {
                  records: records.second,
                }),
                editAfter
              ),
              step
            );
            const a = rebindChangeNodeKeys(
              bindV4DocumentChange(
                createV4DocumentChange(nextEditSteps, {
                  records: records.first,
                }),
                stepAfter
              ),
              edit
            );

            return { a, b };
          }
        } catch {
          // Fall through to normal rebase.
        }
      }
    }
  }

  let nextStepRegs: readonly V4RegisterStep[] = stepRegSteps;
  let nextEditRegs: readonly V4RegisterStep[] = editRegSteps;

  if (editRegSteps.length > 0 || stepRegSteps.length > 0) {
    let regRebase: ReturnType<typeof rebaseV4Changes>;

    try {
      regRebase = rebaseV4Changes(base, editRegSteps, stepRegSteps);
    } catch {
      return null;
    }

    if (!regRebase.ok) return null;
    nextEditRegs = regRebase.aPrime.filter(
      (item): item is V4RegisterStep => item.op === 'set_register'
    );
    nextStepRegs = regRebase.bPrime.filter(
      (item): item is V4RegisterStep => item.op === 'set_register'
    );
  }

  const filteredEditDoc = filterUntouchedMovesForRemovedIds(
    base,
    stepDocSteps,
    editDocSteps
  );
  const droppedMoves = filteredEditDoc.length !== editDocSteps.length;

  // Strip dead text/prop steps on nodes that BOTH edit and step remove.
  const bothRemovedIds = new Set<string>();

  for (const s of editDocSteps) {
    if (
      s.op === 'remove_node' &&
      stepDocSteps.some((st) => st.op === 'remove_node' && st.id === s.id)
    ) {
      bothRemovedIds.add(s.id);
    }
  }
  const effectiveStepDoc =
    bothRemovedIds.size > 0
      ? stepDocSteps.filter((s) => {
          if (
            (s.op === 'insert_text' ||
              s.op === 'delete_text' ||
              s.op === 'format_text') &&
            bothRemovedIds.has(s.target)
          ) {
            return false;
          }
          if (s.op === 'set_props' && bothRemovedIds.has(s.id)) {
            return false;
          }

          return true;
        })
      : stepDocSteps;

  let nextStepDoc: readonly V4Step[] = effectiveStepDoc;
  let nextEditDoc: readonly V4Step[] = filteredEditDoc;

  if (filteredEditDoc.length > 0 || effectiveStepDoc.length > 0) {
    if (wrapsAcrossPeerSplit(filteredEditDoc, effectiveStepDoc)) return null;

    const relocated = tryRelocatedTextDeleteRebase(
      base,
      filteredEditDoc,
      effectiveStepDoc,
      editAfter,
      stepAfter
    );

    if (relocated) {
      nextEditDoc = relocated.editDoc;
      nextStepDoc = relocated.stepDoc;
    } else {
      let docRebase: ReturnType<typeof rebaseV4Changes>;

      try {
        docRebase = rebaseV4Changes(base, filteredEditDoc, effectiveStepDoc, {
          formatConflictWinner: 'a',
          insertTieBreak: exact ? 'a' : 'b',
        });
      } catch {
        return null;
      }

      if (!docRebase.ok) {
        const recovered =
          tryHistoryEscalationRebase(
            docRebase.reason,
            base,
            editDocSteps,
            editAfter,
            effectiveStepDoc,
            stepAfter,
            isSetValued,
            canRemoveEmptyParent
          ) ??
          (docRebase.reason === 'target-deleted'
            ? tryRelocatedRestoreOnDeletedTarget(
                base,
                editDocSteps,
                editAfter,
                effectiveStepDoc,
                stepAfter,
                isSetValued
              )
            : null);

        if (!recovered) return null;
        nextEditDoc = recovered.editDoc;
        nextStepDoc = recovered.stepDoc;
      } else {
        nextEditDoc = docRebase.aPrime;
        nextStepDoc = docRebase.bPrime;

        // If the concurrent edit removed a text block that the step also removes
        // and copies back into another block (paste-at-start undo), drop the
        // resurrected text insertion so deleted text does not return.
        const editRemovedTextNodes = new Set<string>();

        for (const s of editDocSteps) {
          if (s.op === 'remove_node') editRemovedTextNodes.add(s.id);
        }
        if (editRemovedTextNodes.size > 0) {
          const baseById = indexElements(base);
          const deletedTexts = new Set<string>();

          for (const s of effectiveStepDoc) {
            if (s.op === 'remove_node' && editRemovedTextNodes.has(s.id)) {
              const node = baseById.get(s.id);

              if (node && isTextBearingElement(node)) {
                const { units } = toV4TextStream(node.children);

                if (units.length > 0 && units.every((u) => u.kind === 'char')) {
                  deletedTexts.add(
                    units.map((u) => (u.kind === 'char' ? u.ch : '')).join('')
                  );
                }
              }
            }
          }
          if (deletedTexts.size > 0) {
            const matchesDeletedText = (text: string): boolean => {
              for (const deleted of deletedTexts) {
                if (deleted === text || deleted.includes(text)) return true;
              }

              return false;
            };
            const stripped = nextStepDoc.filter(
              (s) => !(s.op === 'insert_text' && matchesDeletedText(s.text))
            );

            if (stripped.length !== nextStepDoc.length) {
              try {
                const viaEdit = applyV4Steps(editAfter, stripped);
                const nextA = extractV4Between(stepAfter, viaEdit, {
                  isSetValued,
                });
                const viaStep = applyV4Steps(stepAfter, nextA);

                if (
                  jsonEqual(viaEdit.children, viaStep.children) &&
                  jsonEqual(viaEdit.roots ?? {}, viaStep.roots ?? {})
                ) {
                  nextStepDoc = stripped;
                  nextEditDoc = nextA;
                }
              } catch {
                // Keep original rebased steps when stripping does not converge.
              }
            }
          }
        }
      }
    }
  }

  const records = {
    first: getInternalDocumentChangeRecords(edit),
    second: getInternalDocumentChangeRecords(step),
  };
  let nextStepSteps: readonly V4Step[] = [...nextStepDoc, ...nextStepRegs];
  let nextEditSteps: readonly V4Step[] = [...nextEditDoc, ...nextEditRegs];

  if (droppedMoves) {
    let ok = false;

    try {
      const viaEdit = applyV4Steps(editAfter, nextStepSteps);
      const viaStep = applyV4Steps(stepAfter, nextEditSteps);

      ok =
        jsonEqual(viaEdit.children, viaStep.children) &&
        jsonEqual(viaEdit.roots ?? {}, viaStep.roots ?? {});
    } catch {
      ok = false;
    }

    if (!ok) {
      const recovered = tryHistoryEscalationRebase(
        'dropped-moves',
        base,
        editDocSteps,
        editAfter,
        stepDocSteps,
        stepAfter,
        isSetValued
      );

      if (!recovered) return null;
      nextStepDoc = recovered.stepDoc;
      nextEditDoc = recovered.editDoc;
      nextStepSteps = [...nextStepDoc, ...nextStepRegs];
      nextEditSteps = [...nextEditDoc, ...nextEditRegs];
    }
  }

  try {
    const b = rebindChangeNodeKeys(
      bindV4DocumentChange(
        createV4DocumentChange(nextStepSteps, { records: records.second }),
        editAfter
      ),
      step
    );
    const a = rebindChangeNodeKeys(
      bindV4DocumentChange(
        createV4DocumentChange(nextEditSteps, { records: records.first }),
        stepAfter
      ),
      edit
    );

    return { a, b };
  } catch {
    return null;
  }
};

export type V4FormatSplit<T extends JsonEditorValue = JsonEditorValue> =
  Readonly<{
    format: DocumentChange;
    formatInverse: DocumentChange;
    structure: DocumentChange;
    structureAfter: T;
  }>;

type V4FormatTextStep = Extract<V4Step, { op: 'format_text' }>;

type FormatCharTarget = Readonly<{
  delta: V4PropDelta;
  id: string;
  offset: number;
}>;

const textPropsOf = (node: JsonNode): JsonRecord => {
  const out: JsonRecord = {};

  for (const [key, value] of Object.entries(node)) {
    if (key !== 'text') out[key] = value;
  }

  return out;
};

const diffUserMarkDelta = (
  beforeMarks: Readonly<JsonRecord>,
  afterMarks: Readonly<JsonRecord>
): V4PropDelta | null => {
  const set: JsonRecord = {};
  const unset: string[] = [];
  const keys = new Set([
    ...Object.keys(beforeMarks),
    ...Object.keys(afterMarks),
  ]);

  for (const key of keys) {
    if (isAuthoredMarkKey(key)) continue;
    if (jsonEqual(beforeMarks[key], afterMarks[key])) continue;
    if (Object.hasOwn(afterMarks, key)) {
      set[key] = afterMarks[key];
    } else {
      unset.push(key);
    }
  }

  if (Object.keys(set).length === 0 && unset.length === 0) return null;

  return {
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset } : {}),
  };
};

const formatStepDelta = (step: V4FormatTextStep): V4PropDelta => ({
  ...(step.set ? { set: step.set } : {}),
  ...(step.unset ? { unset: step.unset } : {}),
  ...(step.add ? { add: step.add } : {}),
  ...(step.remove ? { remove: step.remove } : {}),
});

const coalesceFormatCharTargets = (
  items: readonly FormatCharTarget[]
): readonly V4FormatTextStep[] => {
  const out: V4FormatTextStep[] = [];

  for (const item of items) {
    const prev = out.at(-1);

    if (
      prev &&
      prev.target === item.id &&
      prev.offset + prev.length === item.offset &&
      jsonEqual(formatStepDelta(prev), item.delta)
    ) {
      out[out.length - 1] = { ...prev, length: prev.length + 1 };
    } else {
      out.push({
        ...item.delta,
        length: 1,
        offset: item.offset,
        op: 'format_text',
        target: item.id,
      });
    }
  }

  return out;
};

const elementCharTokenPositions = (
  docIndex: DocumentIndex,
  elementPath: readonly number[]
): readonly number[] | null => {
  const node = docIndex.node(elementPath);

  if (!isElementNode(node) || !isTextBearingElement(node)) return null;

  const positions: number[] = [];
  let pos = docIndex.nodeRange(elementPath).from + 1;

  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];

    if (isTextNode(child)) {
      pos += 1;
      for (let c = 0; c < child.text.length; c += 1) {
        positions.push(pos + c);
      }
      pos += child.text.length + 1;
    } else {
      const childRange = docIndex.nodeRange([...elementPath, i]);

      positions.push(-1);
      pos += childRange.to - childRange.from;
    }
  }

  return positions;
};

const charTargetAtTokenPos = (
  docIndex: DocumentIndex,
  tokenPos: number
): Readonly<{ id: string; offset: number }> | null => {
  const context = docIndex.openContextAt(tokenPos);
  let hostEntry: (typeof context)[number] | undefined;

  for (let i = context.length - 1; i >= 0; i -= 1) {
    if (context[i]?.kind === 'element') {
      hostEntry = context[i];
      break;
    }
  }
  if (!hostEntry) return null;

  const hostNode = docIndex.node(hostEntry.path);

  if (
    !isElementNode(hostNode) ||
    !isTextBearingElement(hostNode) ||
    typeof hostNode.id !== 'string' ||
    hostNode.id.length === 0
  ) {
    return null;
  }

  let pos = hostEntry.from + 1;
  let offset = 0;

  for (let i = 0; i < hostNode.children.length; i += 1) {
    const child = hostNode.children[i];

    if (isTextNode(child)) {
      const textStart = pos + 1;
      const textEnd = textStart + child.text.length;

      if (tokenPos >= textStart && tokenPos < textEnd) {
        return { id: hostNode.id, offset: offset + (tokenPos - textStart) };
      }
      offset += child.text.length;
      pos = textEnd + 1;
    } else {
      const childRange = docIndex.nodeRange([...hostEntry.path, i]);

      offset += 1;
      pos += childRange.to - childRange.from;
    }
  }

  return null;
};

const locateElementById = (
  value: JsonEditorValue,
  targetId: string
): Readonly<{ path: readonly number[]; root: string }> | null => {
  const lookup = getValueIdLookup(value);

  if (lookup) {
    const found = lookup(targetId);

    if (found) return found;
  }

  const scan = (
    nodes: readonly JsonNode[],
    prefix: readonly number[]
  ): readonly number[] | null => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];

      if (!isElementNode(node)) continue;
      const path = [...prefix, i];

      if (node.id === targetId) return path;
      const nested = scan(node.children, path);

      if (nested) return nested;
    }

    return null;
  };

  const mainPath = scan(value.children, []);

  if (mainPath) return { path: mainPath, root: 'main' };
  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      const path = scan(value.roots[root], []);

      if (path) return { path, root };
    }
  }

  return null;
};

type RunStreamItem =
  | Readonly<{ ch: string; kind: 'char'; marks: JsonRecord; tokenPos: number }>
  | Readonly<{ kind: 'token'; token: JsonToken }>;

const extractRunStream = (
  docIndex: DocumentIndex,
  from: number,
  length: number
): readonly RunStreamItem[] => {
  const context = docIndex.openContextAt(from);
  const top = context.at(-1);
  let activeMarks: JsonRecord =
    top?.kind === 'text' ? textPropsOf(docIndex.node(top.path)) : {};
  const { tokens } = docIndex.slice(from, from + length);
  const items: RunStreamItem[] = [];
  let pos = from;

  for (const token of tokens) {
    if (token.kind === 'open' && token.nodeKind === 'text') {
      activeMarks = token.props;
      pos += 1;
    } else if (token.kind === 'close' && token.nodeKind === 'text') {
      activeMarks = {};
      pos += 1;
    } else if (token.kind === 'text') {
      for (let i = 0; i < token.text.length; i += 1) {
        items.push({
          ch: token.text[i],
          kind: 'char',
          marks: activeMarks,
          tokenPos: pos + i,
        });
      }
      pos += token.text.length;
    } else {
      items.push({ kind: 'token', token });
      pos += 1;
    }
  }

  return items;
};

const composeAndStripNoops = (
  base: JsonEditorValue,
  change: DocumentChange,
  formatInverse: DocumentChange
): DocumentChange => {
  let structure = change.compose(formatInverse, base);

  for (const [root, rootChange] of getInternalDocumentChangeEntries(
    structure
  )) {
    const cleaned = rootChange.stripNoopSections(valueRootIndex(base, root));

    if (cleaned !== rootChange) {
      structure = withInternalDocumentRootChange(structure, root, cleaned);
    }
  }

  return structure;
};

const splitCarriedRunFormatTail = <T extends JsonEditorValue>(
  base: T,
  change: DocumentChange,
  after: T,
  carried: readonly CarriedRun[]
): V4FormatSplit<T> | null => {
  const forwardChars: FormatCharTarget[] = [];
  const inverseChars: FormatCharTarget[] = [];

  for (const run of carried) {
    const baseIndex = valueRootIndex(base, run.root);
    const afterIndex = valueRootIndex(after, run.root);
    const baseItems = extractRunStream(baseIndex, run.source, run.length);
    const afterItems = extractRunStream(afterIndex, run.at, run.landed);

    if (baseItems.length !== afterItems.length) return null;

    for (let i = 0; i < baseItems.length; i += 1) {
      const left = baseItems[i];
      const right = afterItems[i];

      if (left.kind !== right.kind) return null;
      if (left.kind === 'token' && right.kind === 'token') {
        if (!tokensEqual(left.token, right.token)) return null;
        continue;
      }
      if (left.kind !== 'char' || right.kind !== 'char') return null;
      if (left.ch !== right.ch) return null;
      if (jsonEqual(left.marks, right.marks)) continue;

      const forwardDelta = diffUserMarkDelta(left.marks, right.marks);
      const inverseDelta = diffUserMarkDelta(right.marks, left.marks);

      if (!forwardDelta || !inverseDelta) return null;

      const target = charTargetAtTokenPos(afterIndex, right.tokenPos);

      if (!target) return null;
      forwardChars.push({
        delta: forwardDelta,
        id: target.id,
        offset: target.offset,
      });
      inverseChars.push({
        delta: inverseDelta,
        id: target.id,
        offset: target.offset,
      });
    }
  }

  if (forwardChars.length === 0) return null;

  const formatSteps = coalesceFormatCharTargets(forwardChars);
  const invFormatSteps = coalesceFormatCharTargets(inverseChars);

  try {
    const structureAfter = applyV4Steps(after, invFormatSteps);
    const format = bindV4DocumentChange(
      createV4DocumentChange(formatSteps),
      structureAfter
    );
    const formatInverse = bindV4DocumentChange(
      createV4DocumentChange(invFormatSteps),
      after
    );
    const structure = composeAndStripNoops(base, change, formatInverse);

    return {
      format,
      formatInverse,
      structure,
      structureAfter,
    };
  } catch {
    return null;
  }
};

export const splitV4FormatTail = <T extends JsonEditorValue>(
  base: T,
  change: DocumentChange,
  after: T,
  isSetValued: DocumentSetPropertyResolver,
  allowExtract = false,
  carried?: readonly CarriedRun[]
): V4FormatSplit<T> | null => {
  const attached = getV4Steps(change);

  if (attached || (allowExtract && !change.empty)) {
    let steps: readonly V4Step[] | null = null;

    try {
      steps = attached ?? extractV4Between(base, after, { isSetValued });
    } catch {
      steps = null;
    }

    if (steps && steps.length > 0) {
      let hasFormat = false;
      let hasStruct = false;

      for (const step of steps) {
        if (isUserFormatStep(step)) hasFormat = true;
        else hasStruct = true;
      }

      if (hasFormat && hasStruct) {
        const structSteps = steps.filter((step) => !isUserFormatStep(step));

        try {
          const structureAfter = applyV4Steps(base, structSteps);
          const formatSteps = extractV4Between(structureAfter, after, {
            isSetValued,
          });

          if (formatSteps.length > 0 && formatSteps.every(isUserFormatStep)) {
            const format = bindV4DocumentChange(
              createV4DocumentChange(formatSteps),
              structureAfter
            );
            const formatInverse = format.invert(structureAfter);
            const structure = composeAndStripNoops(base, change, formatInverse);

            return {
              format,
              formatInverse,
              structure,
              structureAfter,
            };
          }
        } catch {
          // Try carried-run mark split below.
        }
      }
    }
  }

  if (carried && carried.length > 0) {
    return splitCarriedRunFormatTail(base, change, after, carried);
  }

  return null;
};

export const rebaseCarriedFormatViaLetters = (
  structureAfter: JsonEditorValue,
  format: DocumentChange,
  recordedAfter: JsonEditorValue,
  letters: Readonly<{
    root: string;
    letterAt: (position: number) => LetterPlace;
  }>,
  structRepair: DocumentChange,
  repairedStructA: DocumentChange,
  repairedStructAfter: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver
): V4HistoryRebaseResult | null => {
  let formatSteps: readonly V4Step[];

  try {
    formatSteps =
      getV4Steps(format) ??
      extractV4Between(structureAfter, recordedAfter, { isSetValued });
  } catch {
    return null;
  }

  if (formatSteps.length === 0 || !formatSteps.every(isUserFormatStep)) {
    return null;
  }

  const structureIndex = valueRootIndex(structureAfter, letters.root);
  const repairedIndex = valueRootIndex(repairedStructAfter, letters.root);
  const repairRoot = structRepair.empty
    ? null
    : (getInternalDocumentRootChange(structRepair, letters.root) ?? null);
  const projectedChars: FormatCharTarget[] = [];
  const unprojectedChars: FormatCharTarget[] = [];
  const otherRootSteps: V4FormatTextStep[] = [];

  for (const step of formatSteps) {
    if (step.op !== 'format_text') return null;

    const loc = locateElementById(structureAfter, step.target);

    if (!loc) return null;
    if (loc.root !== letters.root) {
      otherRootSteps.push(step);
      continue;
    }

    const positions = elementCharTokenPositions(structureIndex, loc.path);

    if (!positions) return null;

    const delta = formatStepDelta(step);

    for (let k = 0; k < step.length; k += 1) {
      const charOffset = step.offset + k;
      const tokPos = positions[charOffset];

      if (tokPos === undefined || tokPos < 0) {
        unprojectedChars.push({ delta, id: step.target, offset: charOffset });
        continue;
      }

      const landed = letters.letterAt(tokPos);

      if (landed === null) {
        continue;
      }
      if (typeof landed === 'number') {
        const mappedPos = repairRoot ? repairRoot.mapPos(landed, 1) : landed;

        if (mappedPos === null) continue;

        const dest = charTargetAtTokenPos(repairedIndex, mappedPos);

        if (!dest) return null;
        projectedChars.push({ delta, id: dest.id, offset: dest.offset });
      } else {
        unprojectedChars.push({ delta, id: step.target, offset: charOffset });
      }
    }
  }

  const mappedSteps: V4FormatTextStep[] = [
    ...coalesceFormatCharTargets(projectedChars),
  ];
  const unprojectedSteps: V4FormatTextStep[] = [
    ...coalesceFormatCharTargets(unprojectedChars),
    ...otherRootSteps,
  ];

  if (unprojectedSteps.length > 0) {
    let editSteps: readonly V4Step[];

    try {
      editSteps =
        getV4Steps(repairedStructA) ??
        (repairedStructA.empty
          ? []
          : extractV4Between(structureAfter, repairedStructAfter, {
              isSetValued,
            }));
    } catch {
      return null;
    }

    try {
      const rebased = rebaseV4Changes(
        structureAfter,
        editSteps,
        unprojectedSteps,
        { formatConflictWinner: 'a', insertTieBreak: 'b' }
      );

      if (!rebased.ok) return null;
      for (const step of rebased.bPrime) {
        if (step.op !== 'format_text') return null;
        mappedSteps.push(step);
      }
    } catch {
      return null;
    }
  }

  try {
    const b = bindV4DocumentChange(
      createV4DocumentChange(mappedSteps),
      repairedStructAfter
    );
    const afterFmt = b.apply(repairedStructAfter);
    const a = DocumentChange.between(recordedAfter, afterFmt);

    return { a, b };
  } catch {
    return null;
  }
};

const locateTextPointById = (
  value: JsonEditorValue,
  root: string,
  point: JsonPoint
): Readonly<{ id: string; offset: number }> | null => {
  if (point.path.length < 2) return null;

  const hostPath = point.path.slice(0, -1);
  const leafIndex = point.path.at(-1);

  if (leafIndex === undefined) return null;

  let host: JsonNode;

  try {
    host = valueRootIndex(value, root).node(hostPath);
  } catch {
    return null;
  }

  if (
    !isElementNode(host) ||
    !isTextBearingElement(host) ||
    typeof host.id !== 'string' ||
    host.id.length === 0
  ) {
    return null;
  }

  let offset = 0;

  for (let i = 0; i < leafIndex; i += 1) {
    const child = host.children[i];

    if (!child) return null;
    offset += isTextNode(child) ? child.text.length : 1;
  }

  return { id: host.id, offset: offset + point.offset };
};

const resolveIdOffsetToPoint = (
  after: JsonEditorValue,
  root: string,
  targetId: string,
  targetOffset: number,
  hintPath?: readonly number[]
): JsonPoint | null => {
  let found: Readonly<{
    node: JsonElementNode;
    path: readonly number[];
  }> | null = null;

  if (hintPath && hintPath.length > 0) {
    try {
      const node = valueRootIndex(after, root).node(hintPath);

      if (isElementNode(node) && node.id === targetId) {
        found = { node, path: hintPath };
      }
    } catch {
      found = null;
    }
  }

  if (!found) {
    const lookup = getValueIdLookup(after);

    if (lookup) {
      const loc = lookup(targetId);

      if (loc && loc.root === root) {
        try {
          const node = valueRootIndex(after, root).node(loc.path);

          if (isElementNode(node) && node.id === targetId) {
            found = { node, path: loc.path };
          }
        } catch {
          found = null;
        }
      }
    }
  }

  if (!found) {
    const nodes = valueRoot(after, root);
    const find = (
      list: readonly JsonNode[],
      prefix: readonly number[]
    ): Readonly<{ node: JsonElementNode; path: readonly number[] }> | null => {
      for (let i = 0; i < list.length; i += 1) {
        const node = list[i];

        if (!isElementNode(node)) continue;
        const path = [...prefix, i];

        if (node.id === targetId) return { node, path };
        const nested = find(node.children, path);

        if (nested) return nested;
      }

      return null;
    };

    found = find(nodes, []);
  }

  if (!found || !isTextBearingElement(found.node)) return null;

  let cursor = 0;
  let lastTextIndex = -1;
  let lastTextLength = 0;

  for (let i = 0; i < found.node.children.length; i += 1) {
    const child = found.node.children[i];

    if (isTextNode(child)) {
      const end = cursor + child.text.length;

      if (targetOffset >= cursor && targetOffset <= end) {
        return {
          offset: targetOffset - cursor,
          path: [...found.path, i],
        };
      }
      lastTextIndex = i;
      lastTextLength = child.text.length;
      cursor = end;
    } else {
      cursor += 1;
    }
  }

  if (lastTextIndex !== -1) {
    return {
      offset: lastTextLength,
      path: [...found.path, lastTextIndex],
    };
  }

  return null;
};

const lookupTextBearingLength = (
  value: JsonEditorValue,
  targetId: string
): number | undefined => {
  const lookup = getValueIdLookup(value);

  if (lookup) {
    const loc = lookup(targetId);

    if (!loc) return undefined;
    try {
      const node = valueRootIndex(value, loc.root).node(loc.path);

      if (isElementNode(node) && isTextBearingElement(node)) {
        return elementStreamLength(node);
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  const node = indexElements(value).get(targetId);

  return node && isTextBearingElement(node)
    ? elementStreamLength(node)
    : undefined;
};

const mapPointThroughV4Steps = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  steps: readonly V4Step[],
  point: JsonPoint,
  root: string
): JsonPoint | null => {
  const located = locateTextPointById(before, root, point);

  if (!located) return null;

  let { id } = located;
  let { offset } = located;
  const needsLengths = steps.some(
    (step) => step.op === 'split_node' || step.op === 'join_nodes'
  );
  const lengths = new Map<string, number>();
  const getLength = (targetId: string): number | undefined => {
    if (!needsLengths) return undefined;
    if (lengths.has(targetId)) return lengths.get(targetId);
    const len = lookupTextBearingLength(before, targetId);

    if (len !== undefined) lengths.set(targetId, len);

    return len;
  };

  for (const step of steps) {
    switch (step.op) {
      case 'insert_text': {
        if (step.target === id && step.offset < offset) {
          offset += step.text.length;
        }
        if (needsLengths) {
          const prev = getLength(step.target);

          if (prev !== undefined) {
            lengths.set(step.target, prev + step.text.length);
          }
        }
        break;
      }
      case 'delete_text': {
        if (step.target === id) {
          if (offset > step.offset + step.length) {
            offset -= step.length;
          } else if (offset > step.offset) {
            ({ offset } = step);
          }
        }
        if (needsLengths) {
          const prev = getLength(step.target);

          if (prev !== undefined) {
            lengths.set(step.target, Math.max(0, prev - step.length));
          }
        }
        break;
      }
      case 'split_node': {
        const prev = getLength(step.id);

        if (prev !== undefined) {
          lengths.set(step.id, step.at);
          lengths.set(step.newId, Math.max(0, prev - step.at));
        }
        if (step.id === id && offset > step.at) {
          id = step.newId;
          offset -= step.at;
        }
        break;
      }
      case 'join_nodes': {
        const leftLen = getLength(step.target);
        const rightLen = getLength(step.source);

        if (step.source === id) {
          if (leftLen === undefined) return null;
          id = step.target;
          offset += leftLen;
        }
        if (leftLen !== undefined && rightLen !== undefined) {
          lengths.set(step.target, leftLen + rightLen);
        }
        lengths.delete(step.source);
        break;
      }
      case 'remove_node': {
        if (step.id === id) return null;
        lengths.delete(step.id);
        break;
      }
      case 'insert_node': {
        if ('offset' in step.to) {
          if (step.to.id === id && step.to.offset < offset) {
            offset += 1;
          }
          if (needsLengths) {
            const prev = getLength(step.to.id);

            if (prev !== undefined) lengths.set(step.to.id, prev + 1);
          }
        }
        break;
      }
      case 'wrap_inline':
      case 'unwrap_inline': {
        if (
          (step.op === 'wrap_inline' && step.target === id) ||
          (step.op === 'unwrap_inline' &&
            (step.parent === id || step.id === id))
        ) {
          return null;
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  return resolveIdOffsetToPoint(
    after,
    root,
    id,
    offset,
    id === located.id ? point.path.slice(0, -1) : undefined
  );
};

export const mapTextSelectionViaV4 = (
  editor: AnyEditor,
  selection: Selection,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  root: string,
  exact = false
): Selection => {
  if (exact || !selection || !SelectionApi.isText(selection)) {
    return mapSelectionThroughChange(
      editor,
      selection,
      change,
      before,
      after,
      root
    ).selection;
  }

  const steps = getV4Steps(change);

  if (steps) {
    const anchor = mapPointThroughV4Steps(
      before,
      after,
      steps,
      selection.anchor,
      root
    );
    const focus = mapPointThroughV4Steps(
      before,
      after,
      steps,
      selection.focus,
      root
    );

    if (anchor && focus) {
      return {
        ...selection,
        anchor: { ...selection.anchor, ...anchor },
        focus: { ...selection.focus, ...focus },
      };
    }
  }

  return mapSelectionThroughChange(
    editor,
    selection,
    change,
    before,
    after,
    root
  ).selection;
};

export const remintForeignRestoredV4Change = (
  change: DocumentChange,
  liveIds: ReadonlySet<string>,
  currentScope: string,
  mint: () => string,
  renamed: Map<string, string>
): DocumentChange => {
  const steps = getV4Steps(change);

  if (!steps || steps.length === 0) return change;

  let changed = false;

  const mapRef = (id: string): string => {
    const mapped = renamed.get(id);

    if (mapped !== undefined) {
      changed = true;
      return mapped;
    }

    return id;
  };

  const mintIfForeignNonLive = (id: string): string => {
    if (liveIds.has(id)) return id;

    const existing = renamed.get(id);

    if (existing !== undefined) {
      changed = true;
      return existing;
    }

    const parsed = parseScopedElementId(id);

    if (parsed && parsed.scope === currentScope) return id;

    const fresh = mint();

    renamed.set(id, fresh);
    changed = true;

    return fresh;
  };

  const remapNode = (node: JsonNode): JsonNode => {
    if (!isElementNode(node)) return node;

    const nextId =
      typeof node.id === 'string' ? mintIfForeignNonLive(node.id) : node.id;
    const nextChildren = node.children.map(remapNode);

    if (
      nextId === node.id &&
      nextChildren.every((child, index) => child === node.children[index])
    ) {
      return node;
    }

    return {
      ...node,
      ...(nextId === undefined ? {} : { id: nextId }),
      children: nextChildren,
    };
  };

  const remapPlace = (place: V4Place): V4Place =>
    'id' in place ? { ...place, id: mapRef(place.id) } : place;

  const nextSteps: V4Step[] = steps.map((step): V4Step => {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text': {
        return { ...step, target: mapRef(step.target) };
      }
      case 'insert_node': {
        return {
          ...step,
          node: remapNode(step.node) as JsonElementNode,
          to: remapPlace(step.to),
        };
      }
      case 'remove_node':
      case 'set_props': {
        return { ...step, id: mapRef(step.id) };
      }
      case 'move_node': {
        return {
          ...step,
          id: mapRef(step.id),
          to: remapPlace(step.to),
        };
      }
      case 'split_node': {
        return {
          ...step,
          id: mapRef(step.id),
          newId: mintIfForeignNonLive(step.newId),
        };
      }
      case 'join_nodes': {
        return {
          ...step,
          source: mapRef(step.source),
          target: mapRef(step.target),
        };
      }
      case 'wrap_inline': {
        return {
          ...step,
          node: remapNode(step.node) as JsonElementNode,
          target: mapRef(step.target),
        };
      }
      case 'unwrap_inline': {
        return {
          ...step,
          id: mapRef(step.id),
          parent: mapRef(step.parent),
        };
      }
      default: {
        return step;
      }
    }
  });

  if (!changed) return change;

  return createV4DocumentChange(nextSteps, {
    records: getInternalDocumentChangeRecords(change),
  });
};
