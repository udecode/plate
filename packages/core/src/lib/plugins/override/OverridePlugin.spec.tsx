import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';

describe('OverridePlugin', () => {
  it('handles deleteExit through the OverridePlugin Plite extension', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      node: { isElement: true, type: 'callout' },
      rules: {
        break: {
          emptyLineEnd: 'deleteExit',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin],
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'foo\n' }], type: 'callout' }],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'foo' }], type: 'callout' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
