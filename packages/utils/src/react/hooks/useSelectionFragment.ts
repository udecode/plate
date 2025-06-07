import type { EditorPropOptions, TElement } from '@udecode/slate';

import { getContainerTypes } from '@udecode/plate-core';
import { useEditorSelector } from '@udecode/plate-core/react';

export const useSelectionFragment = () => {
  return useEditorSelector((editor) => {
    return editor.api.fragment(editor.selection, {
      unwrap: getContainerTypes(editor),
    });
  }, []);
};

export const useSelectionFragmentProp = (
  options: Omit<EditorPropOptions, 'nodes'> = {}
) => {
  return useEditorSelector((editor) => {
    const fragment = editor.api.fragment<TElement>(editor.selection, {
      unwrap: getContainerTypes(editor),
    });

    return editor.api.prop({ nodes: fragment, ...options });
  }, []);
};
