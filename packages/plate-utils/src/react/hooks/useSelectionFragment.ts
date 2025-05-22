import type { EditorPropOptions, TElement } from '@udecode/slate';

import { useEditorSelector } from '@udecode/plate-core/react';

export const useSelectionFragment = (options?: {
  structuralTypes?: string[];
}) => {
  return useEditorSelector((editor) => {
    return editor.api.fragment(editor.selection, options);
  }, []);
};

export const useSelectionFragmentProp = ({
  structuralTypes,
  ...options
}: { structuralTypes?: string[] } & Omit<EditorPropOptions, 'nodes'> = {}) => {
  return useEditorSelector((editor) => {
    const fragment = editor.api.fragment<TElement>(editor.selection, {
      structuralTypes,
    });

    return editor.api.prop({ nodes: fragment, ...options });
  }, []);
};
