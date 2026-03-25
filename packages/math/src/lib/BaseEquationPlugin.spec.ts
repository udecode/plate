import { createSlateEditor } from 'platejs';

import { BaseEquationPlugin } from './BaseEquationPlugin';

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes insert.equation', () => {
    const editor = createSlateEditor({
      plugins: [BaseEquationPlugin],
    } as any);
    const plugin = editor.getPlugin(BaseEquationPlugin);

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(typeof (editor as any).tf.insert.equation).toBe('function');
  });
});
