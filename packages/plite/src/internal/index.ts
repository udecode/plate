import {
  type Editor as EditorType,
  InternalEditor,
  type Value,
} from '../interfaces/editor';

export {
  defineCommand,
  executeCommand,
  registerCommand,
} from '../core/command-registry';
export {
  getEditorRuntime,
  setEditorRuntime,
} from '../core/editor-runtime';
export {
  getExtensionRegistry as getEditorExtensionRegistry,
  inheritExtensionRegistry as inheritEditorExtensionRegistry,
} from '../core/extension-registry';
export {
  applyOperation,
  applyStatePatches,
  getCachedFullRootReplaceTopLevelRuntimeIds,
  getCurrentMarks as getEditorCurrentMarks,
  getCurrentSelectionRoot as getEditorSelectionRoot,
  getEditorOperationRoot,
  getLiveNode as getEditorLiveNode,
  getLiveSelection as getEditorLiveSelection,
  getLiveText as getEditorLiveText,
  getOperationCount,
  getSnapshotVersion,
  markInternalOwnedReplayOperation,
  setChildren as setEditorChildren,
  setCurrentMarks as setEditorMarks,
  setCurrentSelection as setEditorSelection,
  setTargetRuntime as setEditorTargetRuntime,
  shouldSaveStatePatch,
  withOperationRootChildren,
} from '../core/public-state';
export { hasTransformMiddleware as hasEditorTransformMiddleware } from '../core/transform-middleware';
export {
  getEditorTransformRegistry,
  setEditorTransformRegistry,
} from '../core/transform-registry';
export { projectRangeInSnapshot } from '../range-projection';
export { formatDebugValue } from '../utils/format-debug-value';
export { isObject } from '../utils/is-object';
export {
  getOperationRoot,
  getRangeRoot,
  MAIN_ROOT_KEY,
} from './root-location';

const Editor = InternalEditor;

export interface Editor<
  V extends Value = any,
  TExtensions extends readonly unknown[] = readonly [],
> extends EditorType<V, TExtensions> {}

export { Editor };
