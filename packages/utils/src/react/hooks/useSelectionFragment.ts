import { getContainerTypes } from '@platejs/core';
import { useEditorSelector } from '@platejs/core/react';
import type { EditorPropOptions, TElement } from '@platejs/slate';

export const useSelectionFragment = () =>
  useEditorSelector(
    (editor) =>
      editor.api.fragment(editor.selection, {
        unwrap: getContainerTypes(editor),
      }),
    []
  );

export const useSelectionFragmentProp = (
  options: Omit<EditorPropOptions, 'nodes'> = {}
) =>
  useEditorSelector((editor) => {
    const fragment = editor.api.fragment<TElement>(editor.selection, {
      unwrap: getContainerTypes(editor),
    });

    return editor.api.prop({ nodes: fragment, ...options });
  }, []);
