export type {
  AnyEditor,
  BaseEditor,
  EditorCommandContext,
  PluginDependencyReferenceFor,
  PluginDependencyContractReference,
  PluginFactoryTypeLambda,
  PluginFactoryTypeProvider,
  PluginFactoryTypeProviderOf,
  PluginInstalledCapabilitiesOf,
  PluginTypeProviderOf,
  PluginWitnessFor,
  PluginTypeLambda,
  EditorGenericMethod,
  EditorNodeTypeProvider,
  EditorStateViewProvider,
  EditorValueTypeProvider,
  EditorUpdateTransactionOf,
  EditorUpdateTransactionProvider,
} from '../interfaces/editor';

export { failInvariant } from './fail-invariant';

export { getEditorCommitSnapshot } from '../core/commit';
export {
  observeAnchorStateWork,
  type AnchorStateWork,
} from '../core/anchor-state';
export { getNodeKeyDOMValue } from '../utils/node-keys';
export {
  getAnnotationStoreMetrics,
  type AnnotationStoreMetrics,
} from './view/annotation-store-metrics';

export {
  above,
  addMark,
  collapse,
  delete,
  deleteFragment,
  deselect,
  edges,
  elementReadOnly,
  install,
  first,
  fragment,
  getCollabEffects,
  getPluginRegistry,
  getFragment,
  getLastCommit,
  getPathByNodeKey,
  getNodeKey,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  insertNode,
  insertNodes,
  insertSoftBreak,
  isEdge,
  isElementReadOnly,
  isEmpty,
  isEnd,
  isInline,
  isSelectable,
  isStart,
  isVoid,
  last,
  leaf,
  levels,
  liftNodes,
  mergeNodes,
  moveNodes,
  next,
  parent,
  path,
  point,
  previous,
  projectRange,
  range,
  read,
  removeMark,
  removeNodes,
  replaceChildren,
  reset,
  select,
  setNodes,
  setPoint,
  setSelection,
  shouldMergeNodesRemovePrevNode,
  splitNodes,
  subscribeSource,
  toggleBlock,
  toggleMark,
  unsetNodes,
  unwrapNodes,
  update,
  void,
  wrapNodes,
} from '../interfaces/editor';

export {
  dispatchCommand,
  evaluateCommand,
  hasCommandHandler,
  probeCommandNativeEquivalent,
} from '../core/command-registry';
export type {
  EditorCommandEvaluation,
  EditorCommandNativeProbe,
} from '../core/command-registry';
export { createDetachedContentSlice } from '../core/content-slice';
export type { InternalEditorRuntimeElementEntry } from '../core/snapshot-index';

export {
  createInternalRootChangeFromSections,
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeRanges,
  getInternalDocumentChangeRootKeys,
  hasInternalDocumentChangeRoot,
  mapInternalDocumentChangePoint,
  mapInternalDocumentChangePosition,
} from '../core/change/document-change';
export {
  assertDetachedSelectionSupported,
  mapDetachedSelectionThroughChange,
} from '../core/selection-protocol';
export {
  completePersistedDocumentFields,
  type PersistedDocumentFieldValues,
} from '../core/persisted-document';
export {
  getDocumentChangeRelocations,
  getExactDocumentChangeRelocation,
  getExactDocumentChangeRelocations,
  type DocumentChangeRelocation,
} from '../core/change/mapping';
export {
  compileEditorSchemaCapabilityEntries,
  getEditorAuthoredDocumentCapability,
  withCompiledEditorSchemaCapabilityEntries,
  compileEditorSchemaContractEntries,
  initializePluginEntries,
  initializePlugins,
} from '../create-editor';
export type {
  NativeAuthoredDocumentProjection,
  NativeAuthoredProjectionDiagnostic,
} from '../core/authored-document-capability';
export {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  getCompiledSchemaPropertyId,
  getCompiledPropertyMergeStrategy,
  matchesCompiledSchemaTarget,
  preserveCompiledSchemaPropertyIdentity,
  resolveCompiledSchemaProperty,
  type CompiledEditorSchema,
  type CompiledSchemaConstructionPlan,
  type CompiledSchemaContentProgram,
  type CompiledSchemaElement,
  type CompiledSchemaProperty,
  type CompiledSchemaPropertyMergeStrategy,
  type CompiledSchemaTargetContext,
  type EditorSchemaContributionRecord,
  type EditorSchemaDiagnostic,
} from '../core/schema-compiler';
export { getSchemaElementSourceReference } from '../core/schema-definition';
export {
  containsCompleteEditorSchema,
  brandPluginDescriptor,
  compilePlugin,
  compilePluginInput,
  getCompiledEditorConfiguration,
  getCandidatePluginApi,
  getPluginContributions,
  getInstalledPlugin,
  getInstalledPluginApi,
  isPlugin,
  reportEditorLifecycleError,
  resolveInstalledPlugin,
  setPluginPortalFactory,
  withPluginPortalCandidates,
} from '../core/plugin';
export {
  assertPublicRootKey,
  toInternalRoot,
  toPublicRoot,
} from '../core/public-root';
export {
  createDetachedEditorSchema,
  getCompiledEditorSchemaFromApi,
} from '../core/editor-schema';
export type { InternalEditorSchemaApi } from '../core/editor-schema';
export type { NativeAuthoredDocumentCapability } from '../core/authored-document-capability';
export type {
  EditorSchemaSourceProvider,
  EditorSchemaPluginProvider,
  SchemaDescendantInValue,
  SchemaElementInNode,
  SchemaNodeTypeProvider,
  SchemaTextInNode,
} from '../core/schema-source.internal';
export {
  getEditorRuntimeRoot,
  getEditorRuntime,
  hasEditorRuntime,
  setEditorRuntime,
} from '../core/editor-runtime';
export { createEditorReadApi } from '../core/editor-lifecycle-api';
export type {
  InternalCompiledPluginPublicationEntry,
  InternalPluginPublicationEntry,
} from '../core/editor-runtime';
export {
  getCompiledEditorSchema,
  getPluginRegistry as getInternalPluginRegistry,
  inheritPluginRegistry,
} from '../core/plugin-registry';
export { exportContentSlice } from '../core/editor-read-execution';
export {
  serializeStructuralPlainText,
  type StructuralPlainTextDiagnostic,
  type StructuralPlainTextEncodeContext,
  type StructuralPlainTextEncoder,
  type StructuralPlainTextResult,
} from '../core/plain-text';
export {
  applyBuiltDocumentChange,
  getActiveEditorTransaction,
  getCollabEffectTypes,
  getCurrentMarks as getEditorCurrentMarks,
  getCurrentSelectionRoot as getEditorSelectionRoot,
  getEditorMaxLength,
  getEditorRuntimeElementEntries,
  getEditorRuntimeRootKeys,
  getEditorStateView,
  getEditorUpdateRoot,
  getEditorNodeKeyForNode,
  fitSliceChildren,
  fitSlicePlacements,
  getLiveNode as getEditorLiveNode,
  getLiveText as getEditorLiveText,
  getSnapshotVersion,
  withTransactionSpecDraftRead,
  withEditorDocumentProjection,
  getStateFieldEffectTypes,
  repairEditorValue,
  runTrustedUpdate,
  scheduleAfterCommitNotification,
  setChildren as setEditorChildren,
  setEditorComposing,
  setEditorMaxLength,
  setEditorSnapshotInputTransform,
  setEditorTransactionViewTransform,
  setEditorStateViewTransform,
  setCurrentMarks as setEditorMarks,
  setCurrentSelection as setEditorSelection,
  setTargetRuntime as setEditorTargetRuntime,
  subscribeEditorViewState,
  withEditorUpdateRootScope,
} from '../core/public-state';
export type {
  InternalSliceChildrenTarget,
  InternalSlicePlacement,
} from '../core/public-state';
export { projectRangeInSnapshot } from '../range-projection';
export { mapSemanticUpdateMethodArguments } from '../core/semantic-update-method';
export {
  assertSelectionSupported,
  decodeEditorSelection,
  encodeEditorSelection,
  getSelectionDOMRange,
} from '../core/selection-protocol';
export { createEditorEffect } from '../core/transaction-values';
export {
  assertEditorDocumentContainers,
  EDITOR_DOCUMENT_FIELDS,
  type EditorDocumentShapeIssue,
  type EditorRecordIssue,
  getEditorDocumentShapeIssueMessage,
  isEnvelopeInput,
  readDocumentRecord,
  readEditorDocument,
  readPersistedEnvelope,
  rejectEditorRecord,
} from '../core/document-shape';
export {
  areEditorJsonValuesEqual,
  assertEditorJsonValue,
  cloneEditorJsonValue,
  snapshotEditorJsonValue,
  decodeVersionedValue,
  encodeVersionedValue,
} from '../core/value-codec';
export { readAuthoredView } from '../core/authored-runtime';
export {
  isDocumentView,
  withDocumentViewRead,
} from '../core/document-view-read';
export { formatDebugValue } from '../utils/format-debug-value';
export { isObject } from '../utils/is-object';
export { getRangeRoot, getReaderRange, MAIN_ROOT_KEY } from './root-location';
