import { PlateEditor, Value, getPluginType } from '@udecode/plate-common';

import { ELEMENT_CODE_LINE } from '../constants';

export const getCodeLineType = <V extends Value>(
  editor: PlateEditor<V>
): string => getPluginType(editor, ELEMENT_CODE_LINE);
