import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { Value } from '../../../../core/src/slate/types/TEditor';
import { ELEMENT_CODE_LINE } from '../constants';

export const getCodeLineType = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>
): string => getPluginType(editor, ELEMENT_CODE_LINE);
