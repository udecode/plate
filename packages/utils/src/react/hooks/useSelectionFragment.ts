import {
  getContainerTypes,
  getFragmentProp,
  type GetFragmentPropOptions,
} from '@platejs/core';
import { useEditorSelector } from '@platejs/core/react';

export const useSelectionFragment = () =>
  useEditorSelector((editor) =>
    editor.read.fragment({
      unwrap: getContainerTypes(editor),
    })
  );

export const useSelectionFragmentProp = (
  options: GetFragmentPropOptions = {}
) =>
  useEditorSelector((editor) =>
    getFragmentProp(
      editor.read.fragment({
        unwrap: getContainerTypes(editor),
      }),
      options
    )
  );
