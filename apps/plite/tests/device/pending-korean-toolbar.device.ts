import { expect, test } from '@platejs/test/device';

import { blocks } from './device-reads';

test('a pending Korean word survives a toolbar block-type tap (Slate #5019)', async ({
  device,
}) => {
  const editor = await device.openExample('richtext');
  const initial = await blocks(editor);
  const leaves = initial[0]?.children ?? [];
  const lastLeaf = Math.max(leaves.length - 1, 0);
  const lastText = leaves[lastLeaf]?.text ?? '';

  await editor.touch.tap({ offset: lastText.length, path: [0, lastLeaf] });
  await device.keyboard.use('ko');
  await device.keyboard.type('ㅎㅏㄴ');

  const [typed] = await editor.get.modelBlockTexts();
  const typing = await device.trace();
  const lastComposition = typing.findLast((entry) =>
    entry.type.startsWith('composition')
  );

  // The toolbar tap must land while the word is still composing.
  expect(lastComposition?.type).toMatch(/^composition(start|update)$/);

  await device.touch.tapTestId('block-button-heading-one');

  await expect
    .poll(() => blocks(editor).then(([block]) => block?.type))
    .toBe('heading-one');
  const [heading] = await editor.get.modelBlockTexts();
  const after = await blocks(editor);

  expect(heading).toBe(typed);
  expect(after).toHaveLength(initial.length);
});
