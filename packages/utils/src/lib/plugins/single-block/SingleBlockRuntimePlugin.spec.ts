import { createPlateEditor } from '@platejs/core/react';

import { SingleBlockPlugin } from './SingleBlockPlugin';
import { SingleLinePlugin } from './SingleLinePlugin';

describe('single-block runtime plugins', () => {
  it('routes single-block merging and hard breaks through the Plite runtime', () => {
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'first' }], type: 'p' },
        { children: [{ text: 'second' }], type: 'p' },
        { children: [{ text: 'third' }], type: 'p' },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'first\nsecond\nthird' }], type: 'p' },
    ]);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'firs\nt\nsecond\nthird' }], type: 'p' },
    ]);
  });

  it('routes single-line filtering, merging, and break prevention through the Plite runtime', () => {
    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'first\n' }], type: 'p' },
        { children: [{ text: 'second\rthird' }], type: 'p' },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'firstsecondthird' }], type: 'p' },
    ]);

    editor.update.break.insert();
    editor.update.break.insertSoft();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'firstsecondthird' }], type: 'p' },
    ]);
  });
});
