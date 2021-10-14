import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK } from '../defaults';

export const getCodeBlockType = <T extends SPEditor = SPEditor>(
  editor: T
): string => getPlatePluginType(editor, ELEMENT_CODE_BLOCK);
