import { createSlateEditor } from 'platejs';

import {
  BaseCodeDrawingPlugin,
  CODE_DRAWING_KEY,
} from './BaseCodeDrawingPlugin';

describe('BaseCodeDrawingPlugin', () => {
  it('configures code drawing as a void element node', () => {
    const editor = createSlateEditor({
      plugins: [BaseCodeDrawingPlugin],
    } as any);

    const plugin = editor.getPlugin({ key: CODE_DRAWING_KEY });

    expect(plugin.node.isElement).toBe(true);
    expect(plugin.node.isVoid).toBe(true);
  });
});
