import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../constants';

export const getCodeLineType = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>
): string => getPluginType(editor, ELEMENT_CODE_LINE);
