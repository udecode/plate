import { IndentPlugin, createEditor } from 'platejs/react';
import { TabbablePlugin } from 'platejs/tabbable/react';

import { IndentKit } from './indent';
import { ListKit } from './list';
import { TabbableKit } from './tabbable';

const queryAt = (offset: number, block: Record<string, unknown> = {}) => {
  const editor = createEditor({
    plugins: [...ListKit, ...TabbableKit],
    selection: {
      kind: 'text',
      anchor: { offset, path: [0, 0] },
      focus: { offset, path: [0, 0] },
    },
    initialValue: [
      { children: [{ text: 'one' }], type: 'paragraph', ...block },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ],
  });

  return editor.plugin(TabbablePlugin).store.get('query')({
    editor,
    event: new KeyboardEvent('keydown', { key: 'Tab' }),
  });
};

describe('TabbableKit', () => {
  it.each([0, 3])(
    'allows tab navigation from a plain paragraph at offset %i',
    (offset) => {
      expect(queryAt(offset)).toBe(true);
    }
  );

  it('declines tab navigation in a list item, which takes Tab itself', () => {
    expect(queryAt(1, { indent: 1, listType: 'bulleted' })).toBe(false);
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
      expect(typeof editor.update.indent.increase).toBe('function');
    }
  });
});
