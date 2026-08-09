export type {
  AnyEditor,
  BaseEditor,
  Editor,
  EditorCommandContext,
  EditorExtensionDependencyReferenceFor,
  EditorExtensionTypeLambda,
  InternalEditorExtensionDependencyReference,
  InternalEditorExtensionInstalledCapabilitiesOf,
  InternalEditorExtensionTypeProviderOf,
  InternalEditorExtensionWitnessFor,
  EditorStateViewProvider,
  EditorUpdateTransactionOf,
  EditorUpdateTransactionProvider,
  Value,
} from '../interfaces/editor';
export { txRead } from '../core/tx-only';
export type { TxReadMethod } from '../core/tx-only';

export { failInvariant } from './fail-invariant';

export { getEditorCommitSnapshot } from '../core/commit';

export {
  above,
  addMark,
  after,
  before,
  collapse,
  delete,
  deleteBackward,
  deleteForward,
  deleteFragment,
  deselect,
  edges,
  elementReadOnly,
  install,
  first,
  fragment,
  getChildren,
  getCollabEffects,
  getExtensionRegistry,
  getFragment,
  getLastCommit,
  getPathByNodeKey,
  getNodeKey,
  getSelection,
  getSnapshot,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  insertBreak,
  insertNode,
  insertNodes,
  insertSoftBreak,
  insertText,
  isBlock,
  isEdge,
  isEditor,
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
  move,
  moveNodes,
  next,
  parent,
  path,
  point,
  positions,
  previous,
  projectRange,
  range,
  read,
  removeMark,
  removeNodes,
  replaceChildren,
  replace,
  reset,
  select,
  setNodes,
  setPoint,
  setSelection,
  shouldMergeNodesRemovePrevNode,
  splitNodes,
  string,
  subscribe,
  subscribeCommit,
  subscribeSource,
  toggleBlock,
  toggleMark,
  unhangRange,
  unsetNodes,
  unwrapNodes,
  update,
  void,
  wrapNodes,
} from '../interfaces/editor';

export {
  defineCommand,
  dispatchCommand,
  hasCommandHandler,
} from '../core/command-registry';
export { createDetachedContentSlice } from '../core/content-slice';
export type { InternalEditorRuntimeElementEntry } from '../core/snapshot-index';
export { editorCommands } from '../core/editor-commands';
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
  getDocumentChangeRelocations,
  getExactDocumentChangeRelocation,
  getExactDocumentChangeRelocations,
  type DocumentChangeRelocation,
} from '../core/change/mapping';
export {
  type EditorExtensionsFromOptions,
  type EditorValueFromOptions,
  initializeEditorExtensions,
} from '../create-editor';
export {
  areEditorSchemaIdentitiesEqual,
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  getCompiledSchemaPropertyId,
  getCompiledPropertyMergeStrategy,
  matchesCompiledSchemaTarget,
  readEditorSchemaIdentity,
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
  compileEditorExtension,
  defineExtension,
  getCompiledEditorConfiguration,
  getCandidateEditorExtensionApi,
  getEditorExtensionContributions,
  getInstalledEditorExtension,
  getInstalledEditorExtensionApi,
  isEditorExtension,
  reportEditorLifecycleError,
} from '../core/editor-extension';
export {
  assertPublicRootKey,
  toInternalRoot,
  toPublicRoot,
} from '../core/public-root';
export { getCompiledEditorSchemaFromApi } from '../core/editor-schema';
export type {
  EditorSchemaSource,
  EditorSchemaSourceProvider,
} from '../core/schema-source.internal';
export {
  getEditorRuntime,
  getEditorRuntimeOwner,
  hasEditorRuntime,
  setEditorRuntime,
} from '../core/editor-runtime';
export {
  getCompiledEditorSchema,
  getExtensionRegistry as getEditorExtensionRegistry,
  inheritExtensionRegistry as inheritEditorExtensionRegistry,
} from '../core/extension-registry';
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
  getLiveNode as getEditorLiveNode,
  getLiveSelection as getEditorLiveSelection,
  getLiveText as getEditorLiveText,
  getSnapshotVersion,
  getStateFieldEffectTypes,
  repairEditorValue,
  runTrustedUpdate,
  scheduleAfterCommitNotification,
  setChildren as setEditorChildren,
  setEditorComposing,
  setEditorFocused,
  setEditorMaxLength,
  setEditorReadOnly,
  setEditorSnapshotInputTransform,
  setCurrentMarks as setEditorMarks,
  setCurrentSelection as setEditorSelection,
  setTargetRuntime as setEditorTargetRuntime,
  subscribeEditorViewState,
  toEditorCoreStateView,
  withEditorUpdateRootScope,
} from '../core/public-state';
export { projectRangeInSnapshot } from '../range-projection';
export {
  assertSelectionSupported,
  decodeEditorSelection,
  encodeEditorSelection,
  getSelectionPrimaryRange,
  mapSelectionThroughChange,
} from '../core/selection-protocol';
export { createEditorEffect } from '../core/transaction-values';
export {
  areEditorJsonValuesEqual,
  assertEditorJsonValue,
  decodeEditorEffect,
  decodeVersionedValue,
  encodeEditorEffect,
  encodeVersionedValue,
} from '../core/value-codec';
export { formatDebugValue } from '../utils/format-debug-value';
export { isObject } from '../utils/is-object';
export { getRangeRoot, MAIN_ROOT_KEY } from './root-location';
