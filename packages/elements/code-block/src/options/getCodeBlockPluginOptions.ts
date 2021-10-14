import { getPlatePluginOptions, SPEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';
import { CodeBlockPluginOptions } from '../types';

export const getCodeBlockPluginOptions = <T extends SPEditor = SPEditor>(
  editor: T
): CodeBlockPluginOptions =>
  getPlatePluginOptions(editor, ELEMENT_CODE_BLOCK) as CodeBlockPluginOptions;
