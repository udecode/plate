import type { Editor as EditorType } from '@platejs/plite';
import {
  inheritEditorExtensionRegistry as inheritEditorExtensionRegistryCore,
  getEditorTransformRegistry as readEditorTransformRegistry,
  setEditorTransformRegistry as writeEditorTransformRegistry,
} from '@platejs/plite/internal';

export {
  Editor,
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
