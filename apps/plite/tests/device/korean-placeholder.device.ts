import { expect, test } from '@platejs/test/device';

import { caretLeaf } from './device-reads';

test('commits a Korean word typed under the placeholder once, then Enter splits after it (Slate #5493, #5883)', async ({
  device,
}) => {
  const editor = await device.openExample('custom-placeholder');

  await editor.assert.placeholderVisible(true);
  await editor.touch.tap({ offset: 0, path: [0, 0] });
  expect(device.keyboard.shown()).toBe(true);
  await device.keyboard.use('ko');
  await device.keyboard.type('ㅇㅏㄴㄴㅕㅇ');

  const trace = await device.trace();

  expect(trace.some((entry) => entry.type === 'compositionstart')).toBe(true);
  await editor.assert.modelBlockTexts(['']);
  await editor.assert.placeholderVisible(false);
  await editor.assert.renderedDOMShape({ blockIndex: 0, innerText: '안녕' });
  await device.keyboard.type('\n');
  await expect.poll(() => editor.get.modelBlockTexts()).toEqual(['안녕', '']);

  const caret = await caretLeaf(editor);

  expect(caret?.path[0]).toBe(1);
  expect(device.keyboard.shown()).toBe(true);

  await device.keyboard.type('ㄷㅏ ');
  await editor.assert.modelBlockTexts(['안녕', '다 ']);
  await editor.assert.renderedBlockText(1, '다 ');

  const followUpCaret = await caretLeaf(editor);

  expect(followUpCaret?.before).toBe('다 ');
});
