import { BaseIndentPlugin } from '../../features/indent/lib';
import { BaseListPlugin } from '../../features/list/lib';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor, ParagraphPlugin } from '../../react/core';
import { dispatchPlateShortcut } from '../../react/utils/dispatchPlateShortcut.internal';
import { CopilotPlugin } from './CopilotPlugin';

it('accepts a completion before list indentation and falls through after rejection', () => {
  const editor = createEditor({
    plugins: [ParagraphPlugin, BaseIndentPlugin, BaseListPlugin, CopilotPlugin],
    initialValue: [
      {
        type: 'paragraph',
        indent: 1,
        listType: 'numbered',
        children: [{ text: 'source' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    },
  });
  const pressTab = () =>
    dispatchPlateShortcut(
      editor,
      new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true,
        cancelable: true,
      }),
      'keydown',
      getPlateRuntime(editor).shortcutTable
    );
  editor
    .plugin(CopilotPlugin)
    .update.setBlockSuggestion({ text: ' completion' });
  pressTab();
  expect(editor.read.text.string([])).toBe('source completion');
  expect(editor.read.children()[0]).toMatchObject({ indent: 1 });
  expect(editor.plugin(CopilotPlugin).store.get('suggestionText')).toBeNull();
  editor
    .plugin(CopilotPlugin)
    .update.setBlockSuggestion({ text: ' discarded' });
  editor.plugin(CopilotPlugin).update.reject();
  pressTab();
  expect(editor.read.text.string([])).toBe('source completion');
  expect(editor.read.children()[0]).toMatchObject({ indent: 2 });
});
