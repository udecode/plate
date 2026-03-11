import { createSlateEditor } from '@platejs/core';

import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('delegates insert to insertExitBreak', () => {
    const editor = createSlateEditor({
      plugins: [ExitBreakPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const insertExitBreakSpy = spyOn(editor.tf, 'insertExitBreak');

    editor.tf.exitBreak.insert({});

    expect(insertExitBreakSpy).toHaveBeenCalledWith({});
  });

  it('delegates insertBefore with reverse set to true', () => {
    const editor = createSlateEditor({
      plugins: [ExitBreakPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const insertExitBreakSpy = spyOn(editor.tf, 'insertExitBreak');

    editor.tf.exitBreak.insertBefore({ match: () => true });

    expect(insertExitBreakSpy).toHaveBeenCalledWith({
      match: expect.any(Function),
      reverse: true,
    });
  });
});
