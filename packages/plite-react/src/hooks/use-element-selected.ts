import { useCallback, useContext } from 'react';
import {
  type EditorCommit,
  type Path,
  PathApi,
  RangeApi,
  SelectionApi,
} from '@platejs/plite';
import { ElementPathContext, NodeKeyContext } from '../context';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
  range as editorRange,
} from '../editable/runtime-editor-api';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditorSelector } from './use-editor-selector';
import { useOptionalElement } from './use-element';

/** Selection match mode for `useElementSelected`. */
export type UseElementSelectedMode = 'collapsed' | 'intersects' | 'node';

/** Options for selecting the context element or an explicit element path. */
export type UseElementSelectedOptions = {
  at?: Path | null;
  mode?: UseElementSelectedMode;
};

/** Subscribe to whether an element path matches the current selection. */
export const useElementSelected = ({
  at: path,
  mode = 'intersects',
}: UseElementSelectedOptions = {}): boolean => {
  const element = useOptionalElement();
  const contextPath = useContext(ElementPathContext);
  const nodeKey = useContext(NodeKeyContext);

  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!element && !path) return false;

      const selection = readRuntimeSelection(editor);

      if (!selection) return false;
      const selectedPath =
        path ??
        (nodeKey ? editorGetPathByNodeKey(editor, nodeKey) : null) ??
        contextPath ??
        (element ? ReactEditor.resolvePath(editor, element) : null);
      if (!selectedPath) return false;
      if (!editorHasPath(editor, selectedPath)) return false;
      if (mode === 'node') {
        return (
          SelectionApi.isNode(selection) &&
          PathApi.equals(selection.path, selectedPath)
        );
      }
      if (mode === 'collapsed' && !RangeApi.isCollapsed(selection))
        return false;

      const range = editorRange(editor, selectedPath);
      return !!RangeApi.intersection(range, selection);
    },
    [contextPath, element, mode, path, nodeKey]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (path) {
        return (
          !change ||
          change.selectionChanged ||
          change.changed.hasAny('structure') ||
          change.changed.hasAny('root-order')
        );
      }

      if (!nodeKey || !change) {
        return true;
      }

      return (
        change.changed.hasNodeKey(nodeKey, 'selection') ||
        change.changed.hasNodeKey(nodeKey, 'path')
      );
    },
    [path, nodeKey]
  );

  return useEditorSelector(selector, {
    deferred: true,
    profileId: 'element-selected',
    shouldUpdate,
  });
};
