import type { Editor as EditorType } from '@platejs/plite';
import {
  inheritEditorExtensionRegistry as inheritEditorExtensionRegistryCore,
  getEditorTransformRegistry as readEditorTransformRegistry,
  setEditorTransformRegistry as writeEditorTransformRegistry,
} from '@platejs/plite/internal';

export {
  getCachedFullRootReplaceTopLevelRuntimeIds,
  getEditorCurrentMarks,
  getEditorExtensionRegistry,
  getEditorLiveNode,
  getEditorLiveSelection,
  getEditorLiveText,
  getEditorRuntime,
  getEditorTransformRegistry,
  getOperationCount,
  hasEditorTransformMiddleware,
  markInternalOwnedReplayOperation,
  projectRangeInSnapshot,
  setEditorMarks,
  setEditorRuntime,
  setEditorSelection,
  setEditorTargetRuntime,
  setEditorTransformRegistry,
  withOperationRootChildren,
} from '@platejs/plite/internal';

export const inheritEditorExtensionRegistry = (
  editor: EditorType,
  source: EditorType
) => {
  inheritEditorExtensionRegistryCore(editor, source);
};

export const inheritEditorTransformRegistry = (
  editor: EditorType,
  source: EditorType
) => {
  writeEditorTransformRegistry(editor, readEditorTransformRegistry(source));
};

export {
  above,
  after,
  before,
  defineEditorExtension,
  getLastCommit,
  getPathByRuntimeId,
  getRuntimeId,
  getSelection,
  getSnapshot,
  hasPath,
  isBlock,
  isEditor,
  isElementReadOnly,
  isInline,
  isStart,
  isVoid,
  leaf,
  next,
  point,
  pointRef,
  projectRange,
  range,
  rangeRef,
  string,
  subscribeCommit,
  subscribeSource,
  void,
} from '@platejs/plite/internal';

export type Editor = EditorType;
