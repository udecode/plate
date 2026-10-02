import { expect, test } from '@platejs/test/device';

import { caretLeaf } from './device-reads';

const KOREAN_COMPOSITION_ISSUE =
  'docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/android-gboard-korean-composition.md';

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
  await device.knownFailure({
    desired: '안녕',
    issue: KOREAN_COMPOSITION_ISSUE,
    name: 'Gboard composes 안녕 into one word under the placeholder',
    observed: 'ㅇㅏㄴㄴㅕㅇ',
    read: () => editor.get.modelText(),
  });

  const typed = await editor.get.modelText();

  await editor.assert.renderedBlockText(0, typed);
  await device.keyboard.type('\n');

  await device.knownFailure({
    desired: [typed, ''],
    issue: KOREAN_COMPOSITION_ISSUE,
    name: 'Enter splits after the composing jamo',
    observed: ['ㅇㅏㄴㄴㅕ', 'ㅇ'],
    read: () => editor.get.modelBlockTexts(),
  });

  const split = await editor.get.modelBlockTexts();

  expect(split.join('')).toBe(typed);

  const caret = await caretLeaf(editor);

  expect(caret?.path[0]).toBe(1);
  expect(device.keyboard.shown()).toBe(true);
});
