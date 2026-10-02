import { expect, test } from '@platejs/test/device';

import { blocks, caretLeaf } from './device-reads';

test('a collapsed Bold toggle keeps the keyboard and types one bold run (Slate #6022)', async ({
  device,
}) => {
  const editor = await device.openExample('richtext');
  const [first] = await editor.get.modelBlockTexts();
  const [block] = await blocks(editor);
  const leaves = block?.children ?? [];
  const lastLeaf = Math.max(leaves.length - 1, 0);
  const lastText = leaves[lastLeaf]?.text ?? '';

  await editor.touch.tap({ offset: lastText.length, path: [0, lastLeaf] });
  await device.keyboard.use('en');
  await device.touch.tapTestId('mark-button-bold');
  expect(device.keyboard.shown()).toBe(true);

  await device.keyboard.type('ab');
  await device.keyboard.type('c');

  await expect
    .poll(() => editor.get.modelBlockTexts().then(([text]) => text))
    .toBe(`${first}abc`);

  const [typedBlock] = await blocks(editor);
  const runs = (typedBlock?.children ?? []).filter(
    (leaf) => leaf.bold && leaf.text?.includes('abc')
  );

  expect(runs.map((leaf) => leaf.text)).toEqual(['abc']);

  const caret = await caretLeaf(editor);

  expect(caret?.collapsed).toBe(true);
  expect(caret?.leaf?.bold).toBe(true);
  expect(caret?.before).toBe('abc');
  expect(device.keyboard.shown()).toBe(true);
});
