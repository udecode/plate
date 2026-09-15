import type { Value } from '../..';
import { getInternalDocumentChangeRootKeys } from '../../core/change/document-change';
import {
  dispatchCommand,
  evaluateCommand,
  evaluateCommandWithState,
  hasCommandHandler,
  probeCommandNativeEquivalent,
} from '../../core/command-registry';
import { editorCommands } from '../../core/editor-commands';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  hasEditorRuntime,
  setEditorRuntime,
} from '../../core/editor-runtime';
import { definePlugin, getPluginContributions } from '../../core/plugin';
import { inheritPluginRegistry as inheritPluginRegistryCore } from '../../core/plugin-registry';
import { toInternalRoot } from '../../core/public-root';
import {
  applyTransactionSpec,
  continueTransactionSpec,
  createTransactionSpec,
  getCurrentMarks as getEditorCurrentMarks,
  getCurrentSelectionRoot as getEditorSelectionRoot,
  getEditorMaxLength,
  getEditorRuntimeElementEntries,
  getEditorRuntimeRootKeys,
  getEditorStateView,
  getLiveNode as getEditorLiveNode,
  getLiveText as getEditorLiveText,
  runTrustedUpdate,
  rebaseTransactionSpecWithoutChanges,
  setCurrentMarks as setEditorMarks,
  setEditorComposing,
  setEditorFocused,
  setEditorMaxLength,
  setEditorReadOnly,
  setTargetRuntime as setEditorTargetRuntime,
  subscribeEditorViewState,
  withEditorUpdateRootScope,
} from '../../core/public-state';
import { getSelectionDOMRange } from '../../core/selection-protocol';
import { areEditorJsonValuesEqual } from '../../core/value-codec';
import {
  above,
  after,
  before,
  deleteFragment,
  getLastCommit,
  getNodeKey,
  getPathByNodeKey,
  getPluginRegistry,
  getSelection,
  getSnapshot,
  hasPath,
  isBlock,
  isEditor,
  isElementReadOnly,
  isInline,
  isStart,
  isVoid,
  insertText,
  leaf,
  move,
  next,
  point,
  projectRange,
  range,
  string,
  subscribeCommit,
  subscribeSource,
  type AnyEditor as EditorType,
  void as editorVoid,
} from '../../interfaces/editor';
import { failInvariant } from '../../internal/fail-invariant';
import { projectRangeInSnapshot } from '../../range-projection';
import { getNodeKeyDOMValue } from '../../utils/node-keys';

export type { AnyEditor } from '../../interfaces/editor';

export {
  applyTransactionSpec,
  areEditorJsonValuesEqual,
  dispatchCommand,
  evaluateCommand,
  evaluateCommandWithState,
  editorCommands,
  getEditorCurrentMarks,
  getPluginContributions,
  getPluginRegistry,
  getEditorLiveNode,
  getEditorLiveText,
  getEditorRuntimeElementEntries,
  getEditorRuntimeRootKeys,
  getEditorStateView,
  getInternalDocumentChangeRootKeys,
  getEditorMaxLength,
  getEditorRuntime,
  getEditorRuntimeOwner,
  getNodeKeyDOMValue,
  getEditorSelectionRoot,
  failInvariant,
  hasCommandHandler,
  hasEditorRuntime,
  projectRangeInSnapshot,
  probeCommandNativeEquivalent,
  runTrustedUpdate,
  continueTransactionSpec,
  createTransactionSpec,
  rebaseTransactionSpecWithoutChanges,
  setEditorMarks,
  setEditorComposing,
  setEditorFocused,
  setEditorMaxLength,
  setEditorReadOnly,
  setEditorRuntime,
  setEditorTargetRuntime,
  withEditorUpdateRootScope,
  subscribeEditorViewState,
  toInternalRoot,
};

export const inheritPluginRegistry = (
  editor: EditorType,
  source: EditorType
) => {
  inheritPluginRegistryCore(editor, source);
};

export {
  above,
  after,
  before,
  deleteFragment,
  definePlugin,
  getLastCommit,
  getPathByNodeKey,
  getNodeKey,
  getSelection,
  getSelectionDOMRange,
  getSnapshot,
  hasPath,
  isBlock,
  isEditor,
  isElementReadOnly,
  isInline,
  isStart,
  isVoid,
  insertText,
  leaf,
  move,
  next,
  point,
  projectRange,
  range,
  string,
  subscribeCommit,
  subscribeSource,
  editorVoid as void,
};

export type Editor<V extends Value = any> = EditorType<V>;
