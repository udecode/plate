import type { BaseEditor } from '@platejs/core';
import type { Value } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const someToggle = <V extends Value>(editor: BaseEditor<V>) =>
  !!editor.read.selection() &&
  editor.read.nodes.some({
    match: { type: KEYS.toggle },
  });
