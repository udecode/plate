import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../constants';

export const getCodeLineType = <V extends Value>(
  editor: PlateEditor<V>
): string => getPluginType(editor, ELEMENT_CODE_LINE);
