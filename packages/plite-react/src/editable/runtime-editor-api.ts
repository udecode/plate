import type { Editor as EditorType } from '@platejs/plite';
import { inheritEditorExtensionRegistry as inheritEditorExtensionRegistryCore } from '@platejs/plite/internal';

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
  getEditorSelectionRoot,
  failInvariant,
  hasCommandHandler,
  hasEditorRuntime,
  projectRangeInSnapshot,
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
} from '@platejs/plite/internal';

export const inheritEditorExtensionRegistry = (
  editor: EditorType<any, any>,
  source: EditorType<any, any>
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
  getSelectionPrimaryRange,
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
} from '@platejs/plite/internal';

export type Editor = EditorType<any, any>;
