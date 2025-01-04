import { useEditorSelector } from '@udecode/plate-core/react';
import {
  type GetFragmentPropOptions,
  type TElement,
  getFragmentProp,
} from '@udecode/slate';

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
}: { structuralTypes?: string[] } & GetFragmentPropOptions = {}) => {
  return useEditorSelector((editor) => {
    const fragment = editor.api.fragment<TElement>(editor.selection, {
      structuralTypes,
    });

    return getFragmentProp(fragment, options);
  }, []);
};
