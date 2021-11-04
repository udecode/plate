import {
  getPlatePluginOptions,
  PlateEditor,
  PlatePluginOptions,
} from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLinePluginOptions = <T = {}>(
  editor: PlateEditor<T>
): PlatePluginOptions => getPlatePluginOptions(editor, ELEMENT_CODE_LINE);
