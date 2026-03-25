import { createSlateEditor } from 'platejs';

import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';

describe('BaseInlineEquationPlugin', () => {
  it('configures inlineEquation as an inline void element and exposes insert.inlineEquation', () => {
    const editor = createSlateEditor({
      plugins: [BaseInlineEquationPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseInlineEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isInline: true,
      isVoid: true,
    });
    expect(typeof (editor as any).tf.insert.inlineEquation).toBe('function');
  });
});
