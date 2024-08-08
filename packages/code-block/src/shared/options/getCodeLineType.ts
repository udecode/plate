import { type PlateEditor, getPluginType } from '@udecode/plate-common/server';

import { ELEMENT_CODE_LINE } from '../constants';

export const getCodeLineType = (editor: PlateEditor): string =>
  getPluginType(editor, ELEMENT_CODE_LINE);
