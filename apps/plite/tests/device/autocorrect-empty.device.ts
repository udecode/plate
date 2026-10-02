import { expect, test } from '@platejs/test/device';

import { caretLeaf } from './device-reads';

test('autocorrect on space in an empty editor replaces the word and keeps typing after it (Slate #5891)', async ({
  device,
}) => {
  const editor = await device.openExample('custom-placeholder');

  await editor.touch.tap({ offset: 0, path: [0, 0] });
  await device.keyboard.use('en');
  await device.keyboard.type('becuase go');

  await device.knownFailure({
    desired: 'Because go',
    issue:
      'docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/android-gboard-autocorrect-append.md',
    name: 'autocorrect replaces Becuase before go is typed',
    observed: 'BecuasegoBecause ',
    read: () => editor.get.modelText(),
  });

  const typed = await editor.get.modelText();

  await editor.assert.renderedBlockText(0, typed);

  const caret = await caretLeaf(editor);

  expect(caret?.collapsed).toBe(true);
  expect(device.keyboard.shown()).toBe(true);
});
