import { expect, test } from '@platejs/test/device';

import { blocks, caretLeaf } from './device-reads';

test('a suggestion-strip replacement after a bold leaf commits one corrected word (Slate #5643, #5130)', async ({
  device,
}) => {
  const editor = await device.openExample('richtext');

  await editor.touch.tap({ offset: 4, path: [1, 1] });
  await device.keyboard.use('en');
  await device.keyboard.type(' helo');

  const typed = await device.trace();
  const before = typed.at(-1)?.seq ?? 0;
  const tapped = await device.tapStrip(/^hello$/i);
  const trace = await device.trace();
  const replacement = trace.filter(
    (entry) => entry.seq > before && entry.type === 'beforeinput'
  );

  expect(replacement.map((entry) => entry.inputType)).toEqual([
    'deleteContentBackward',
    'insertText',
  ]);

  const [, paragraph] = await editor.get.modelBlockTexts();

  expect(paragraph).toContain(`bold ${tapped}`);
  expect(paragraph).not.toMatch(/hel\w*hel/i);
  expect(paragraph.match(/hello/gi)).toHaveLength(1);
  // A word typed at the end of a bold leaf continues the bold run.
  const [, block] = await blocks(editor);

  expect(block?.children?.find((leaf) => leaf.bold)?.text).toMatch(
    /^bold hello/i
  );

  const caret = await caretLeaf(editor);

  expect(caret?.collapsed).toBe(true);
  expect(caret?.before.trimEnd().endsWith(tapped)).toBe(true);
  expect(device.keyboard.shown()).toBe(true);
});
