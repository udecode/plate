import type { PlateEditor } from '@udecode/plate-common';

import { TogglePlugin } from '../TogglePlugin';

export function getEnclosingToggleIds(
  editor: PlateEditor,
  elementId: string
): string[] {
  return editor.getOptions(TogglePlugin).toggleIndex?.get(elementId) || [];
}
