import type { PlateEditor } from '@udecode/plate-common';

import { CodeLinePlugin } from '../CodeBlockPlugin';

export const getCodeLineType = (editor: PlateEditor): string =>
  editor.getType(CodeLinePlugin);
