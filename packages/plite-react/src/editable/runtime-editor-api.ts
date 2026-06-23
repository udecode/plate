import type { Editor as PliteEditor } from '@platejs/plite';
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
  editor: PliteEditor,
  source: PliteEditor
) => {
  inheritEditorExtensionRegistryCore(editor, source);
};

export const inheritEditorTransformRegistry = (
  editor: PliteEditor,
  source: PliteEditor
) => {
  writeEditorTransformRegistry(editor, readEditorTransformRegistry(source));
};
