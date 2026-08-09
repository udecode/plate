import { useCallback, useContext } from 'react';
import type { EditorCommit, Path } from '@platejs/plite';
import { NodeKeyContext } from '../context';
import { getPathByNodeKey as editorGetPathByNodeKey } from '../editable/runtime-editor-api';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditorSelector } from './use-editor-selector';

const samePath = (left: Path | null, right: Path | null) => {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;

  return left.every((segment, index) => segment === right[index]);
};

/** Subscribe to the live path for the current rendered element. */
export const useElementPath = (): Path | null => {
  const nodeKey = useContext(NodeKeyContext);

  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!nodeKey) {
        return null;
      }

      const path = editorGetPathByNodeKey(editor, nodeKey);

      return path ? ([...path] as Path) : null;
    },
    [nodeKey]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (!nodeKey || !change) {
        return true;
      }

      return change.changed.hasNodeKey(nodeKey, 'path');
    },
    [nodeKey]
  );

  return useEditorSelector(selector, {
    equalityFn: samePath,
    profileId: 'element-path',
    runtimeEventSource: 'path',
    nodeKey,
    shouldUpdate,
  });
};
