import type { BaseEditor } from '@platejs/core';
import type { Value } from '@platejs/plite';

import { BaseTogglePlugin } from '../../lib';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = <V extends Value>(
  editor: BaseEditor<V>,
  elementId: string
) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return editor
    .plugin(BaseTogglePlugin)
    .getOption('someClosed', enclosingToggleIds);
};
