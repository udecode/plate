import { isSelectionInRange } from '@udecode/plate-common';
import {
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from '../lint-plugin';

export const useAnnotationSelected = () => {
  const { useOption } = useEditorPlugin(ExperimentalLintPlugin);
  const activeAnnotation = useOption('activeAnnotation');

  return useEditorSelector(
    (editor) => {
      if (!editor.selection || !activeAnnotation) return false;
      if (
        isSelectionInRange(editor, { at: activeAnnotation.rangeRef.current! })
      )
        return true;

      return false;
    },
    [activeAnnotation]
  );
};
