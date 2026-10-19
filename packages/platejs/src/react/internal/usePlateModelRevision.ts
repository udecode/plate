import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';
import type { Editor } from '../../lib';
import { useEditorRuntimeState } from '../plite-react';

/** Subscribe mounted Plate projections to the current atomic model publication. */
export const usePlateModelRevision = (editor: Editor) =>
  useEditorRuntimeState(editor, () => getCompiledPlateModel(editor).revision);
