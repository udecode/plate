export {
  DOM_CLIPBOARD_HANDLERS,
  dispatchDOMClipboardHandlers,
  getDOMClipboardFormatKey,
  readDOMFragmentData,
  setDOMClipboardFormatKey,
  writeDOMHostFragmentData,
} from '../plugin/dom-clipboard-runtime';
export type {
  DOMCoverageBoundary,
  DOMCoverageBoundaryAnchor,
  DOMCoverageBoundaryEdge,
  DOMCoverageBoundaryState,
  DOMCoverageCopyPolicy,
  DOMCoverageDOMPointResult,
  DOMCoverageDOMRangeResult,
  DOMCoverageFindPolicy,
  DOMCoverageMaterializeHandler,
  DOMCoverageMaterializeRangeRole,
  DOMCoverageMaterializeReason,
  DOMCoverageMaterializeResult,
  DOMCoveragePathRange,
  DOMCoverageReason,
  DOMCoverageRuntimeRange,
  DOMCoverageSelectionPolicy,
  DOMCoveragePlitePointResult,
} from '../plugin/dom-coverage';
export { DOMCoverage } from '../plugin/dom-coverage';
export type { DOMEditorInterface } from '../plugin/dom-editor';
export {
  createDOMEditorCapability,
  DOMEditor,
  getOrCreateDOMNodeKey,
  setEditorDOMEditableElement,
  setEditorDOMRootElement,
  setEditorDOMScrollElement,
  subscribeEditorDOMScope,
} from '../plugin/dom-editor';
export {
  createDOMGeometryKernel,
  getPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  getPliteStringLength,
  getPliteStringLineEdgeTextOffset,
  getPliteStringPlacementDOMPoint,
  hasUsableDOMRect,
} from '../plugin/dom-geometry';
export {
  createDOMPhaseScheduler,
  destroyEditorDOMPhaseSchedulerFallback,
  installEditorDOMPhaseScheduler,
  scheduleEditorDOMPhase,
} from '../plugin/dom-phase-scheduler';
export {
  DOMIntegrityObserver,
  type DOMIntegrityDiagnostics,
  type DOMIntegrityMutationEvidence,
  type DOMIntegrityMutationOwner,
  type DOMIntegrityObserverOptions,
  type DOMIntegrityRepairEvidence,
} from '../plugin/dom-integrity-observer';
export {
  selectDOMInputDefaultActionPhase,
  type DOMInputDefaultActionPhase,
  type DOMInputDefaultActionPhaseInput,
} from '../plugin/dom-input-runtime';
export {
  DOMRootRuntime,
  type DOMRootRuntimeOptions,
  findEditorDOMRootRuntime,
  findDOMRootRuntime,
} from '../plugin/dom-root-runtime';
export {
  getDOMHostLanguage,
  hasDOMHostQuirk,
  isAndroidDOMHost,
  isBlinkDOMHost,
  isGeckoDOMHost,
  isWebKitDOMHost,
  supportsDOMBeforeInput,
  usesAppleDOMHotkeys,
} from '../utils/environment';
export { createCompiledHotkeyMatcher } from '../utils/hotkey-match';
export {
  DOMSyncMutationOwnership,
  isDOMSyncMutation,
  markDOMSyncMutationTarget,
} from '../plugin/dom-sync-mutation-ownership';
export { parseDOMClipboardHtml } from '../plugin/dom-html';
export type {
  DOMPhase,
  DOMPhaseScheduleOptions,
  DOMPhaseScheduler,
  DOMPhaseSchedulerDiagnostic,
  DOMPhaseSchedulerDiagnostics,
  DOMPhaseTiming,
} from '../plugin/dom-phase-scheduler';
export type {
  DOMGeometryAssociation,
  DOMGeometryPoint,
  DOMGeometryRect,
  PliteStringCoordinatePlacement,
} from '../plugin/dom-geometry';
export {
  getNodeDataAttributeKeys,
  getElements,
  isEditor,
  isElement,
  isLeaf,
  isNode,
  isString,
  isText,
  isVoid,
  keyToDataAttribute,
} from '../utils/plite-dom-markers';
export { replaceDOMSelectionRange } from '../utils/dom';
export {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_DOM_EDITABLE,
  EDITOR_TO_DOM_ROOT,
  EDITOR_TO_DOM_SCOPE_LISTENERS,
  EDITOR_TO_DOM_SCROLL,
  EDITOR_TO_FORCE_RENDER,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_PENDING_SELECTION,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  EDITOR_TO_ROOT_VIEW_EDITORS,
  EDITOR_TO_SCHEDULE_FLUSH,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  IS_FOCUSED,
  IS_NODE_MAP_DIRTY,
  IS_READ_ONLY,
  MARK_PLACEHOLDER_SYMBOL,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
  NODE_TO_RUNTIME_ID,
  PLACEHOLDER_SYMBOL,
} from '../utils/weak-maps';
