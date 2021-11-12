import { getPlugin, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';
import { CodeBlockPluginOptions } from '../types';

export const getCodeBlockPluginOptions = <T = {}>(
  editor: PlateEditor<T>
): CodeBlockPluginOptions =>
  getPlugin(editor, ELEMENT_CODE_BLOCK) as CodeBlockPluginOptions;
