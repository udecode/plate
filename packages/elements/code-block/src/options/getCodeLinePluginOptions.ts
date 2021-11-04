import {
  getPlatePluginOptions,
  PlateEditor,
  PlatePluginOptions,
  TPlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLinePluginOptions = <T = TPlateEditor>(
  editor: T
): PlatePluginOptions => getPlatePluginOptions(editor, ELEMENT_CODE_LINE);
