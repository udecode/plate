import { expect, it } from 'bun:test';

import { createEditor, NodeApi } from 'platejs';
import { BaseLintPlugin } from 'platejs/lint';

import { fillerWords } from './lint';

const setup = (text: string) => {
  const editor = createEditor({
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
    plugins: [
      BaseLintPlugin.configure({ initialState: { rules: [fillerWords] } }),
    ],
  });
  const lint = editor.plugin(BaseLintPlugin);
  const blockText = () => NodeApi.string(editor.read.children()[0]);
  const next = () => {
    lint.update.move(1);

    const selection = editor.read.selection();

    return (
      selection &&
      blockText().slice(selection.anchor.offset, selection.focus.offset)
    );
  };
  const fixFirst = () => lint.update.fix(lint.api.findings()[0].id);

  editor.update.selection.set({ path: [0, 0], offset: 0 });

  return { blockText, fixFirst, next };
};

it('reaches each of two adjacent filler words and cuts both cleanly', () => {
  const { blockText, fixFirst, next } = setup('It is really very.');

  expect(next()).toBe(' really');
  expect(next()).toBe(' very');
  expect(fixFirst()).toBe(true);
  expect(fixFirst()).toBe(true);
  expect(blockText()).toBe('It is.');
});

it('reaches each filler when the block starts with two of them', () => {
  const { blockText, fixFirst, next } = setup('Really very good.');

  expect(next()).toBe('Really ');
  expect(next()).toBe('very ');
  expect(fixFirst()).toBe(true);
  expect(fixFirst()).toBe(true);
  expect(blockText()).toBe('good.');
});
