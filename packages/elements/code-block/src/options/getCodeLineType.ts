import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLineType = <T = {}>(editor: PlateEditor<T>): string =>
  getPlatePluginType(editor, ELEMENT_CODE_LINE);
