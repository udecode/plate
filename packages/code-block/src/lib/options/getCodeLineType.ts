import { type PlateEditor, getPluginType } from '@udecode/plate-common';

import { CodeLinePlugin } from '../CodeBlockPlugin';

export const getCodeLineType = (editor: PlateEditor): string =>
  getPluginType(editor, CodeLinePlugin.key);
