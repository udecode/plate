import { useCallback, useContext } from 'react';

import {
  type EditorCommit,
  type NodeKey,
  type Path,
  PathApi,
  SelectionApi,
} from '../..';
import { NodeKeyContext } from '../context';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
} from '../editable/runtime-editor-api';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditorSelector } from './use-editor-selector';
import { useOptionalElement } from './use-element';

/** Selection match mode for `useElementSelected`. */
export type UseElementSelectedMode = 'collapsed' | 'intersects' | 'node';

/** Options for selecting the context element or an explicit element path. */
export type UseElementSelectedOptions = {
  at?: NodeKey | Path | null;
  mode?: UseElementSelectedMode;
};

/** Subscribe to whether an element path matches the current selection. */
export const useElementSelected = ({
  at,
  mode = 'intersects',
}: UseElementSelectedOptions = {}): boolean => {
  const element = useOptionalElement();
  const contextNodeKey = useContext(NodeKeyContext);
  const explicitNodeKey = typeof at === 'string' ? at : null;
  const explicitPath = Array.isArray(at) ? at : null;
  const watchedNodeKey =
    explicitNodeKey ?? (explicitPath ? null : contextNodeKey);

  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!element && !explicitPath && !watchedNodeKey) return false;

      const selection = readRuntimeSelection(editor);

      if (!selection) return false;
      const selectedPath =
        explicitPath ??
        (watchedNodeKey
          ? editorGetPathByNodeKey(editor, watchedNodeKey)
          : null) ??
        (element ? ReactEditor.resolvePath(editor, element) : null);
      if (!selectedPath) return false;
      if (!editorHasPath(editor, selectedPath)) return false;
      if (mode === 'node') {
        return (
          SelectionApi.isNode(selection) &&
          selection.paths.some((candidatePath) =>
            PathApi.equals(candidatePath, selectedPath)
          )
        );
      }
      if (mode === 'collapsed' && !editor.read.selection.isCollapsed()) {
        return false;
      }

      return editor.read.selection.intersects(selectedPath);
    },
    [element, explicitPath, mode, watchedNodeKey]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (explicitPath) {
        return (
          !change ||
          change.selectionChanged ||
          change.changed.hasAny('structure') ||
          change.changed.hasAny('root-order')
        );
      }

      if (!watchedNodeKey || !change) {
        return true;
      }

      return (
        change.changed.hasNodeKey(watchedNodeKey, 'selection') ||
        change.changed.hasNodeKey(watchedNodeKey, 'path')
      );
    },
    [explicitPath, watchedNodeKey]
  );

  return useEditorSelector(selector, {
    deferred: true,
    nodeKey: explicitPath ? null : watchedNodeKey,
    profileId: 'element-selected',
    runtimeEventSource: 'selection',
    shouldUpdate,
  });
};
