import {
  getPlatePluginOptions,
  PlateEditor,
  TPlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';
import { CodeBlockPluginOptions } from '../types';

export const getCodeBlockPluginOptions = <T = TPlateEditor>(
  editor: PlateEditor<T>
): CodeBlockPluginOptions =>
  getPlatePluginOptions(editor, ELEMENT_CODE_BLOCK) as CodeBlockPluginOptions;
