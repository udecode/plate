import type { Editor as SlateEditor } from '@platejs/slate';
import {
  inheritEditorExtensionRegistry as inheritEditorExtensionRegistryCore,
  getEditorTransformRegistry as readEditorTransformRegistry,
  setEditorTransformRegistry as writeEditorTransformRegistry,
} from '@platejs/slate/internal';

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
} from '@platejs/slate/internal';

export const inheritEditorExtensionRegistry = (
  editor: SlateEditor,
  source: SlateEditor
) => {
  inheritEditorExtensionRegistryCore(editor, source);
};

export const inheritEditorTransformRegistry = (
  editor: SlateEditor,
  source: SlateEditor
) => {
  writeEditorTransformRegistry(editor, readEditorTransformRegistry(source));
};
