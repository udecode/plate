import { getFragmentProp, type GetFragmentPropOptions } from '@platejs/core';
import { getCompiledPlateContainerTypes } from '@platejs/core/internal';
import { useEditorSelector } from '@platejs/core/react';

export const useSelectionFragment = () =>
  useEditorSelector((editor) =>
    editor.read.fragment({
      unwrap: getCompiledPlateContainerTypes(editor),
    })
  );

export const useSelectionFragmentProp = (
  options: GetFragmentPropOptions = {}
) =>
  useEditorSelector((editor) =>
    getFragmentProp(
      editor.read.fragment({
        unwrap: getCompiledPlateContainerTypes(editor),
      }),
      options
    )
  );
