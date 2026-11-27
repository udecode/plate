import { getCompiledPlateModel } from '../../internal/plugin/compilePlateModel';
import type { Editor } from '../../lib';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

export const usePlateModelRevision = (editor: Editor) =>
  useEditorSelector(editor, () => getCompiledPlateModel(editor).revision);
