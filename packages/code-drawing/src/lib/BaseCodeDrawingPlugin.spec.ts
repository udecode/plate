import { createBaseEditor } from '@platejs/core';

import {
  BaseCodeDrawingPlugin,
  CODE_DRAWING_KEY,
} from './BaseCodeDrawingPlugin';

describe('BaseCodeDrawingPlugin', () => {
  it('configures code drawing as a void element node', () => {
    const editor = createBaseEditor({
      plugins: [BaseCodeDrawingPlugin],
    });

    const plugin = editor.getPlugin(BaseCodeDrawingPlugin);

    expect(plugin.node.isElement).toBe(true);
    expect(plugin.node.isVoid).toBe(true);
    expect(editor.getType(CODE_DRAWING_KEY)).toBe(CODE_DRAWING_KEY);
  });
});
