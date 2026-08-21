import { useEditorRuntimeState } from '@platejs/plite-react';

import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';
import type { BaseEditor } from '../../lib';

/** Subscribe mounted Plate projections to the current atomic model publication. */
export const usePlateModelRevision = (editor: BaseEditor) =>
  useEditorRuntimeState(editor, () => getCompiledPlateModel(editor).revision);
