import { useCallback, useContext } from 'react';
import type { EditorCommit, Operation, Path } from '@platejs/slate';
import { NodeRuntimeIdContext } from '../context';
import { Editor } from '../editable/runtime-editor-api';
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

      const path = Editor.getPathByRuntimeId(editor, runtimeId);

      return path ? ([...path] as Path) : null;
    },
    [runtimeId]
  );

  const shouldUpdate = useCallback(
    (_operations?: readonly Operation[], change?: EditorCommit) => {
      if (!runtimeId || !change) {
        return true;
      }

      if (
        change.fullDocumentChanged ||
        change.rootRuntimeIdsChanged ||
        change.structureChanged ||
        change.topLevelOrderChanged
      ) {
        return true;
      }

      return false;
    },
    [runtimeId]
  );

  return useEditorSelector(selector, samePath, {
    profileId: 'element-path',
    runtimeEventSource: 'path',
    runtimeId,
    shouldUpdate,
  });
};
