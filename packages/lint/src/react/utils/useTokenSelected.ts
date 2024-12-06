import { isSelectionInRange } from '@udecode/plate-common';
import {
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from '../lint-plugin';

export const useTokenSelected = () => {
  const { useOption } = useEditorPlugin(ExperimentalLintPlugin);
  const activeToken = useOption('activeToken');

  return useEditorSelector(
    (editor) => {
      if (!editor.selection || !activeToken) return false;
      if (isSelectionInRange(editor, { at: activeToken.rangeRef.current! }))
        return true;

      return false;
    },
    [activeToken]
  );
};
