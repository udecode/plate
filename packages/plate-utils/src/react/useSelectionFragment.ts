import { useEditorSelector } from '@udecode/plate-core/react';
import {
  type GetFragmentPropOptions,
  type GetSelectionFragmentOptions,
  getFragmentProp,
  getSelectionFragment,
} from '@udecode/slate-utils';

export const useSelectionFragment = (options?: GetSelectionFragmentOptions) => {
  return useEditorSelector((editor) => {
    return getSelectionFragment(editor, options);
  }, []);
};

export const useSelectionFragmentProp = ({
  structuralTypes,
  ...options
}: GetSelectionFragmentOptions & GetFragmentPropOptions = {}) => {
  return useEditorSelector((editor) => {
    const fragment = getSelectionFragment(editor, { structuralTypes });

    return getFragmentProp(fragment, options);
  }, []);
};
