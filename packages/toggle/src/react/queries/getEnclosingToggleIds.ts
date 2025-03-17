import type { SlateEditor } from '@udecode/plate';

import { TogglePlugin } from '../TogglePlugin';

export function getEnclosingToggleIds(
  editor: SlateEditor,
  elementId: string
): string[] {
  return editor.getOptions(TogglePlugin).toggleIndex?.get(elementId) || [];
}
