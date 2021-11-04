import {
  getPlatePluginType,
  PlateEditor,
  TPlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';

export const getCodeBlockType = <T = TPlateEditor>(editor: T): string =>
  getPlatePluginType(editor, ELEMENT_CODE_BLOCK);
