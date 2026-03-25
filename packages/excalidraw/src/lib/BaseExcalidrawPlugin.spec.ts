import { createSlateEditor, KEYS } from 'platejs';

import { BaseExcalidrawPlugin } from './BaseExcalidrawPlugin';

describe('BaseExcalidrawPlugin', () => {
  it('registers excalidraw as a void element plugin', () => {
    const editor = createSlateEditor({
      plugins: [BaseExcalidrawPlugin],
    });
    const plugin = editor.getPlugin(BaseExcalidrawPlugin);

    expect(plugin.key).toBe(KEYS.excalidraw);
    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
  });
});
