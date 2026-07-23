import { useEditorRuntimeState } from '@platejs/plite-react';

import type { BaseEditor } from '../../lib';

import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';

/** Subscribe mounted Plate projections to the current atomic model publication. */
export const usePlateModelRevision = (editor: BaseEditor) =>
  useEditorRuntimeState(editor, () => getCompiledPlateModel(editor).revision);
