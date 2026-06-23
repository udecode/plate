import type { BasePlateEditor } from 'platejs';

import { TogglePlugin } from '../TogglePlugin';

export function getEnclosingToggleIds(
  editor: BasePlateEditor,
  elementId: string
): string[] {
  return editor.getOptions(TogglePlugin).toggleIndex?.get(elementId) || [];
}
