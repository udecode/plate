import { isSelectionInRange } from '@udecode/plate-common';
import {
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from '../lint-plugin';

export const useAnnotationSelected = () => {
  const { useOption } = useEditorPlugin(ExperimentalLintPlugin);
  const activeAnnotations = useOption('activeAnnotations');

  return useEditorSelector(
    (editor) => {
      if (!editor.selection || !activeAnnotations?.length) return false;

      const range = activeAnnotations[0].rangeRef.current;

      if (
        range &&
        isSelectionInRange(editor, {
          at: range,
        })
      ) {
        return true;
      }

      return false;
    },
    [activeAnnotations]
  );
};
