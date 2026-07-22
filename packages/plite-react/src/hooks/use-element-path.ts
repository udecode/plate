import { useCallback, useContext } from 'react';
import type { EditorCommit, Path } from '@platejs/plite';
import { NodeRuntimeIdContext } from '../context';
import { getPathByRuntimeId as editorGetPathByRuntimeId } from '../editable/runtime-editor-api';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditorSelector } from './use-editor-selector';

const samePath = (left: Path | null, right: Path | null) => {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;

  return left.every((segment, index) => segment === right[index]);
};

/** Subscribe to the live path for the current rendered element. */
export const useElementPath = (): Path | null => {
  const runtimeId = useContext(NodeRuntimeIdContext);

  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!runtimeId) {
        return null;
      }

      const path = editorGetPathByRuntimeId(editor, runtimeId);

      return path ? ([...path] as Path) : null;
    },
    [runtimeId]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (!runtimeId || !change) {
        return true;
      }

      return change.changed.hasRuntime(runtimeId, 'path');
    },
    [runtimeId]
  );

  return useEditorSelector(selector, {
    equalityFn: samePath,
    profileId: 'element-path',
    runtimeEventSource: 'path',
    runtimeId,
    shouldUpdate,
  });
};
