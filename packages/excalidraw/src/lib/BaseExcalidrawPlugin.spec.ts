import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseExcalidrawPlugin } from './BaseExcalidrawPlugin';

describe('BaseExcalidrawPlugin', () => {
  it('registers excalidraw as a void element plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });
    const plugin = editor.getPlugin(BaseExcalidrawPlugin);

    expect(plugin.key).toBe(KEYS.excalidraw);
    expect(plugin.node.isElement).toBe(true);
    expect(plugin.node.isVoid).toBe(true);
    expect(editor.getType(KEYS.excalidraw)).toBe(KEYS.excalidraw);
  });
});
