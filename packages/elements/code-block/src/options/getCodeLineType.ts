import {
  getPlatePluginType,
  PlateEditor,
  TPlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLineType = <T = TPlateEditor>(editor: T): string =>
  getPlatePluginType(editor, ELEMENT_CODE_LINE);
