import { getCompiledPlateContainerTypes } from '../../internal/plugin/compilePlateModel';
import {
  getFragmentProp,
  type GetFragmentPropOptions,
} from '../../lib/utils/getFragmentProp';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

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
