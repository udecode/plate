import { createPlateEditor } from '@platejs/core/react';
import { getPlateRuntime } from '@platejs/core/internal';

import { SingleBlockPlugin } from './SingleBlockPlugin';
import { SingleLinePlugin } from './SingleLinePlugin';
import { TrailingBlockPlugin } from '../trailing-block/TrailingBlockPlugin';

describe('single-block runtime plugins', () => {
  it('routes single-block merging and hard breaks through the Plite runtime', () => {
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [
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
      initialValue: [
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

  it.each([
    [SingleBlockPlugin, 'singleBlock'],
    [SingleLinePlugin, 'singleLine'],
  ] as const)('%s weakly disables an installed trailing block in either array order', (plugin, key) => {
    for (const plugins of [
      [plugin, TrailingBlockPlugin],
      [TrailingBlockPlugin, plugin],
    ]) {
      const editor = createPlateEditor({ plugins });

      expect(getPlateRuntime(editor).plugins[key]).toBeDefined();
      expect(
        getPlateRuntime(editor).plugins[TrailingBlockPlugin.key]
      ).toBeUndefined();
    }
  });
});
