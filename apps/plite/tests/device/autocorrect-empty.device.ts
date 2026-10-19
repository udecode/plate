import { expect, test } from '@platejs/test/device';

test('autocorrect on space in an empty editor replaces the word and keeps typing after it (Slate #5891)', async ({
  device,
}) => {
  const editor = await device.openExample('custom-placeholder');

  await editor.touch.tap({ offset: 0, path: [0, 0] });
  await device.keyboard.use('en');
  await device.keyboard.type('becuase go');

  await expect.poll(() => editor.get.modelText()).toBe('Because go');
  await editor.assert.renderedBlockText(0, 'Because go');
  await editor.assert.selection({
    anchor: { offset: 10, path: [0, 0] },
    focus: { offset: 10, path: [0, 0] },
  });
  await editor.assert.domCaret({ offset: 10, text: 'Because go' });
  expect(device.keyboard.shown()).toBe(true);

  await device.keyboard.type('x');
  await expect.poll(() => editor.get.modelText()).toBe('Because gox');
  await editor.assert.renderedBlockText(0, 'Because gox');
  await editor.assert.selection({
    anchor: { offset: 11, path: [0, 0] },
    focus: { offset: 11, path: [0, 0] },
  });
  await editor.assert.domCaret({ offset: 11, text: 'Because gox' });
  expect(device.keyboard.shown()).toBe(true);
});
