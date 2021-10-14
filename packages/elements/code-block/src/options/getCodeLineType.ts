import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_CODE_LINE } from '../defaults';

export const getCodeLineType = <T extends SPEditor = SPEditor>(
  editor: T
): string => getPlatePluginType(editor, ELEMENT_CODE_LINE);
