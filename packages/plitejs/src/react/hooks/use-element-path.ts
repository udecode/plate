import { useCallback, useContext } from 'react';

import type { EditorCommit, Path } from '../..';
import { keyMovedAt } from '../../core/commit';
import { ElementContext } from '../context';
import { readPathByNodeKey } from '../editable/runtime-live-state';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditorContext } from './use-editor-context';
import { useEditorSelector } from './use-editor-selector';

const samePath = (left: Path | null, right: Path | null) => {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;

  return left.every((segment, index) => segment === right[index]);
};

/** Subscribe to the live path for the current rendered element. */
export const useElementPath = (): Path | null => {
  const element = useContext(ElementContext);
  const renderedPath = element?.path ?? null;
  const nodeKey = element?.nodeKey ?? null;
  const root = useEditorContext().read.view.root();

  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      const path = readPathByNodeKey(editor, nodeKey) ?? renderedPath;

      return path ? ([...path] as Path) : null;
    },
    [nodeKey, renderedPath]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => {
      if (!nodeKey || !change) {
        return true;
      }

      return keyMovedAt(change.changed, nodeKey, root);
    },
    [nodeKey, root]
  );

  return useEditorSelector(selector, {
    equalityFn: samePath,
    profileId: 'element-path',
    runtimeEventSource: 'path',
    nodeKey,
    shouldUpdate,
  });
};
