import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';

export const getCodeBlockType = <T = {}>(editor: PlateEditor<T>): string =>
  getPluginType(editor, ELEMENT_CODE_BLOCK);
