import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseExcalidrawPlugin } from './BaseExcalidrawPlugin';

describe('BaseExcalidrawPlugin', () => {
  it('registers excalidraw as a void element plugin', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });
    const plugin = editor.getPlugin(BaseExcalidrawPlugin);
    const element = { children: [{ text: '' }], type: KEYS.excalidraw };

    expect(plugin.key).toBe(KEYS.excalidraw);
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.property(BaseExcalidrawPlugin)?.value.kind).toBe(
      'json'
    );
    expect(editor.getType(KEYS.excalidraw)).toBe(KEYS.excalidraw);
  });

  it('rejects malformed drawing data', () => {
    const editor = createBaseEditor({
      plugins: [BaseExcalidrawPlugin],
    });

    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ text: '' }],
            data: { elements: [], state: [] },
            type: KEYS.excalidraw,
          },
        ],
      })
    ).toThrow(/element property "data" fails custom property validation/);
  });
});
