import { useEditorRuntimeState } from 'plitejs/react';

import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';
import type { Editor } from '../../lib';

/** Subscribe mounted Plate projections to the current atomic model publication. */
export const usePlateModelRevision = (editor: Editor) =>
  useEditorRuntimeState(editor, () => getCompiledPlateModel(editor).revision);
