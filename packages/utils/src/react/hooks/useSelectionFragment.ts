import { getContainerTypes } from '@platejs/core';
import { useEditorSelector } from '@platejs/core/react';
import type { Descendant, Element } from '@platejs/slate';

type SelectionFragmentPropOptions = {
  defaultValue?: string;
  getProp?: (node: Descendant) => any;
  key?: string;
  mode?: 'all' | 'block' | 'text';
};

export const useSelectionFragment = () =>
  useEditorSelector(
    (editor) =>
      editor.api.fragment(editor.selection, {
        unwrap: getContainerTypes(editor),
      }),
    []
  );

export const useSelectionFragmentProp = (
  options: SelectionFragmentPropOptions = {}
) =>
  useEditorSelector((editor) => {
    const fragment = editor.api.fragment<Element>(editor.selection, {
      unwrap: getContainerTypes(editor),
    });

    return editor.api.prop({ nodes: fragment, ...options });
  }, []);
