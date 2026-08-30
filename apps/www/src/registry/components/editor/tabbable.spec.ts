import { getPlateRuntime } from 'platejs';
import { IndentPlugin, createEditor } from 'platejs/react';
import { TabbablePlugin } from 'platejs/tabbable/react';

import { IndentKit } from './indent';
import { TabbableKit } from './tabbable';

const createTestEditor = (offset: number) =>
  createEditor({
    plugins: TabbableKit,
    selection: {
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    initialValue: [
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ],
  });

describe('TabbableKit', () => {
  it('disables tab handling at the current block edges', () => {
    for (const offset of [0, 3]) {
      const editor = createTestEditor(offset);

      expect(
        editor.plugin(TabbablePlugin).store.get('query')?.(
          new KeyboardEvent('keydown')
        )
      ).toBe(false);
    }
  });

  it('allows tab handling inside a plain block', () => {
    const editor = createTestEditor(1);

    expect(editor.read.selection.isAtBlockStart()).toBe(false);
    expect(editor.read.selection.isAtBlockEnd()).toBe(false);
    expect(
      editor.plugin(TabbablePlugin).store.get('query')?.(
        new KeyboardEvent('keydown')
      )
    ).toBe(true);
  });

  it('keeps Indent installed while removing its competing shortcuts', () => {
    for (const plugins of [
      [...IndentKit, ...TabbableKit],
      [...TabbableKit, ...IndentKit],
    ]) {
      const editor = createEditor({ plugins });
      const indent = editor.plugin(IndentPlugin);

      expect(indent.shortcuts.tab).toBeNull();
      expect(indent.shortcuts.untab).toBeNull();
      expect(getPlateRuntime(editor).shortcuts['indent.tab']).toBeUndefined();
      expect(getPlateRuntime(editor).shortcuts['indent.untab']).toBeUndefined();
      expect(typeof editor.update.indent.change).toBe('function');
    }
  });
});
