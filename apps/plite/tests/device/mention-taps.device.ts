import { expect, test } from '@platejs/test/device';

import { blocks, caretLeaf } from './device-reads';

const mentionCount = async (editor: Parameters<typeof blocks>[0]) =>
  JSON.stringify(await blocks(editor)).split('"mention"').length - 1;

test('a mention option tap commits once and Backspace removes the mention (autocomplete Android gate)', async ({
  device,
}) => {
  test.skip(
    !device.state.wwwURL,
    'Set PLATE_DEVICE_WWW_PORT to the www dev server that serves /blocks/mention-demo.'
  );

  const editor = await device.openWww('/blocks/mention-demo');
  const start = await mentionCount(editor);
  const [text] = await editor.get.modelBlockTexts();

  await editor.touch.tap({ offset: text.length, path: [0, 0] });
  await device.keyboard.use('en');
  await device.keyboard.type(' @bi');
  await device.touch.tapText('Biggs Darklighter');

  await expect.poll(() => mentionCount(editor)).toBe(start + 1);
  expect(device.keyboard.shown()).toBe(true);
  const caret = await caretLeaf(editor);

  expect(caret?.collapsed).toBe(true);

  await device.keyboard.type('\b');
  await device.keyboard.type('\b');

  await expect.poll(() => mentionCount(editor)).toBe(start);
  expect(device.keyboard.shown()).toBe(true);
});
