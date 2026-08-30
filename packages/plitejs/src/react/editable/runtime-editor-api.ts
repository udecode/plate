import {
  type AnyEditor as EditorType,
  inheritEditorExtensionRegistry as inheritEditorExtensionRegistryCore,
} from '../../internal';

export type { AnyEditor } from '../../internal';

export {
  areEditorJsonValuesEqual,
  dispatchCommand,
  editorCommands,
  getEditorCurrentMarks,
  getEditorExtensionContributions,
  getEditorExtensionRegistry,
  getEditorLiveNode,
  getEditorLiveSelection,
  getEditorLiveText,
  getEditorRuntimeElementEntries,
  getEditorRuntimeRootKeys,
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
} from '../../internal';

export const inheritEditorExtensionRegistry = (
  editor: EditorType,
  source: EditorType
) => {
  inheritEditorExtensionRegistryCore(editor, source);
};

export {
  above,
  after,
  before,
  deleteFragment,
  defineExtension,
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
  void,
} from '../../internal';

export type Editor = EditorType;
