import type { BaseEditor } from '@platejs/core';
import type { Value } from '@platejs/plite';

import { TogglePlugin } from '../TogglePlugin';

export function getEnclosingToggleIds<V extends Value>(
  editor: BaseEditor<V>,
  elementId: string
): string[] {
  return (
    editor.plugin(TogglePlugin).getOptions().toggleIndex.get(elementId) ?? []
  );
}
