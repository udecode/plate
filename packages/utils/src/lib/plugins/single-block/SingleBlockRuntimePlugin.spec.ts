import { createPlateEditor } from 'platejs/react';

import { SingleBlockPlugin } from './SingleBlockPlugin';
import { SingleLinePlugin } from './SingleLinePlugin';

describe('single-block runtime plugins', () => {
  it('routes single-block merging and hard breaks through the Slate v2 runtime', () => {
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'first' }], type: 'p' },
        { children: [{ text: 'second' }], type: 'p' },
        { children: [{ text: 'third' }], type: 'p' },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'first\nsecond\nthird' }], type: 'p' },
    ]);

    editor.tf.insertBreak();

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'firs\nt\nsecond\nthird' }], type: 'p' },
    ]);
  });

  it('routes single-line filtering, merging, and break prevention through the Slate v2 runtime', () => {
    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'first\n' }], type: 'p' },
        { children: [{ text: 'second\rthird' }], type: 'p' },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'firstsecondthird' }], type: 'p' },
    ]);

    editor.tf.insertBreak();
    editor.tf.insertSoftBreak();

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'firstsecondthird' }], type: 'p' },
    ]);
  });
});
