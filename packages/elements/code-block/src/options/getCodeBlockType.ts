import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';

export const getCodeBlockType = <T = {}>(editor: PlateEditor<T>): string =>
  getPlatePluginType(editor, ELEMENT_CODE_BLOCK);
