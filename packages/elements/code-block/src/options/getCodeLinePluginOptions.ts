import {
  getPlatePluginOptions,
  PlatePluginOptions,
  SPEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLinePluginOptions = <T extends SPEditor = SPEditor>(
  editor: T
): PlatePluginOptions => getPlatePluginOptions(editor, ELEMENT_CODE_LINE);
