import { expect, test } from '@platejs/test/device';

for (const route of [
  'homepage',
  'plaintext',
  'custom-placeholder',
  'empty-plaintext',
]) {
  test(`Gboard Korean keeps a continuous draft at the ${route} line end until Space commits it once`, async ({
    device,
  }, info) => {
    const editor =
      route === 'homepage'
        ? await device.openWww('/')
        : await device.openExample(
            route === 'empty-plaintext' ? 'plaintext' : route
          );
    const plainText = 'This is editable plain text, just like a <textarea>!';
    const blockIndex =
      route === 'homepage' || route === 'empty-plaintext' ? 1 : 0;
    const path = route === 'homepage' ? [1, 4] : [blockIndex, 0];
    const prefix =
      route === 'homepage'
        ? "Experience a modern rich-text editor built with React. This playground showcases just a part of Plate's capabilities. Explore the documentation to discover more."
        : route === 'plaintext'
          ? plainText
          : route === 'custom-placeholder'
            ? '가 '
            : '';
    const leafPrefix = route === 'homepage' ? ' to discover more.' : prefix;
    const renderedPrefix =
      route === 'homepage'
        ? "Experience a modern rich-text editor built with \u00A0React\u00A0. This playground showcases just a part of Plate's capabilities. \u00A0Explore the documentation\u00A0 to discover more."
        : prefix;

    if (route === 'homepage') {
      await device.touch.tapText(' to discover more.');
      await editor.touch.tap({ offset: leafPrefix.length, path });
    } else if (route === 'custom-placeholder') {
      await editor.assert.placeholderVisible(true);
      await editor.touch.tap({ offset: 0, path: [0, 0] });
    } else {
      await editor.assert.modelBlockTexts([plainText]);
      await editor.touch.tap({ offset: plainText.length, path: [0, 0] });
    }
    await device.keyboard.use('ko');
    if (route === 'custom-placeholder') {
      await device.keyboard.type('ㄱㅏ ');
      await editor.assert.placeholderVisible(false);
    } else if (route === 'empty-plaintext') {
      await device.keyboard.type('\n');
      await editor.assert.modelBlockTexts([plainText, '']);
    }
    await editor.assert.modelBlockText(blockIndex, prefix);
    await editor.assert.renderedBlockText(blockIndex, renderedPrefix);
    await editor.assert.collapsedModelDOMSelection({
      offset: leafPrefix.length,
      path,
      text: leafPrefix,
    });

    const before = await editor.get.modelBlockTexts();
    const beforeTrace = await device.trace();
    const firstSeq = beforeTrace.at(-1)?.seq ?? 0;

    await device.keyboard.type('ㅎㅏㄴㄱㅡㄹ');
    await editor.assert.renderedBlockText(blockIndex, `${renderedPrefix}한글`);
    await editor.assert.modelBlockTexts(before);
    await editor.assert.selection({
      anchor: { offset: leafPrefix.length, path },
      focus: { offset: leafPrefix.length, path },
    });
    await editor.assert.domSelectionTarget({
      anchorPath: path,
      isCollapsed: true,
    });

    const preeditTrace = await device.trace();
    const preedit = preeditTrace.filter((entry) => entry.seq > firstSeq);

    expect(preedit.some((entry) => entry.type === 'compositionstart')).toBe(
      true
    );
    expect(
      preedit.findLast((entry) => entry.type === 'compositionupdate')?.data
    ).toBe('한글');
    expect(preedit.filter((entry) => entry.type === 'compositionend')).toEqual(
      []
    );
    expect(
      preedit.findLast((entry) => entry.type === 'input')?.isComposing
    ).toBe(true);
    await info.attach('continuous-preedit', {
      body: JSON.stringify({
        events: preedit,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });

    await device.keyboard.type(' ');
    await editor.assert.modelBlockTexts(
      before.toSpliced(blockIndex, 1, `${prefix}한글 `)
    );
    await editor.assert.renderedBlockText(blockIndex, `${renderedPrefix}한글 `);
    await editor.assert.collapsedModelDOMSelection({
      offset: leafPrefix.length + 3,
      path,
      text: `${leafPrefix}한글 `,
    });

    const committedTrace = await device.trace();
    const committed = committedTrace.filter((entry) => entry.seq > firstSeq);

    expect(
      committed
        .filter((entry) => entry.type === 'compositionend')
        .map((entry) => entry.data)
    ).toEqual(['한글']);
    await info.attach('space-commit', {
      body: JSON.stringify({
        events: committed,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });

    await device.keyboard.type('ㅎㅏㄴ');
    await editor.assert.renderedBlockText(
      blockIndex,
      `${renderedPrefix}한글 한`
    );
    await editor.assert.modelBlockTexts(
      before.toSpliced(blockIndex, 1, `${prefix}한글 `)
    );
    await device.keyboard.type(' ');
    await editor.assert.modelBlockTexts(
      before.toSpliced(blockIndex, 1, `${prefix}한글 한 `)
    );
    await editor.assert.renderedBlockText(
      blockIndex,
      `${renderedPrefix}한글 한 `
    );
    await editor.assert.collapsedModelDOMSelection({
      offset: leafPrefix.length + 5,
      path,
      text: `${leafPrefix}한글 한 `,
    });
    expect(await editor.get.modelBlockTexts()).toHaveLength(before.length);
    expect(device.keyboard.shown()).toBe(true);

    const followUpTrace = await device.trace();
    const followUp = followUpTrace.filter((entry) => entry.seq > firstSeq);

    expect(
      followUp
        .filter((entry) => entry.type === 'compositionend')
        .map((entry) => entry.data)
    ).toEqual(['한글', '한']);
    await info.attach('follow-up-commit', {
      body: JSON.stringify({
        events: followUp,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });
  });
}

test('Gboard Korean replaces the selected plaintext word once and preserves its neighbors', async ({
  device,
}, info) => {
  const editor = await device.openExample('plaintext');

  await editor.assert.modelBlockTexts([
    'This is editable plain text, just like a <textarea>!',
  ]);
  await editor.touch.tap({ offset: 12, path: [0, 0] });
  await device.keyboard.use('ko');
  await editor.touch.press({ offset: 12, path: [0, 0] });
  await expect.poll(() => editor.get.selectedText()).toBe('editable');
  await editor.assert.selection({
    anchor: { offset: 8, path: [0, 0] },
    focus: { offset: 16, path: [0, 0] },
  });

  const beforeTrace = await device.trace();
  const firstSeq = beforeTrace.at(-1)?.seq ?? 0;

  await device.keyboard.type('ㅎㅏㄴㄱㅡㄹ');
  await editor.assert.modelBlockTexts([
    'This is editable plain text, just like a <textarea>!',
  ]);
  await editor.assert.renderedBlockText(
    0,
    'This is 한글 plain text, just like a <textarea>!'
  );
  await editor.assert.domSelectionTarget({
    anchorPath: [0, 0],
    isCollapsed: true,
  });

  const preeditTrace = await device.trace();
  const preedit = preeditTrace.filter((entry) => entry.seq > firstSeq);

  expect(preedit.some((entry) => entry.type === 'compositionstart')).toBe(true);
  expect(
    preedit.findLast((entry) => entry.type === 'compositionupdate')?.data
  ).toBe('한글');
  expect(preedit.filter((entry) => entry.type === 'compositionend')).toEqual(
    []
  );
  expect(preedit.findLast((entry) => entry.type === 'input')?.isComposing).toBe(
    true
  );
  await info.attach('replacement-preedit', {
    body: JSON.stringify({
      events: preedit,
      model: await editor.get.modelBlockTexts(),
      snapshot: await editor.snapshot(),
    }),
    contentType: 'application/json',
  });

  await device.keyboard.type(' ');
  await editor.assert.modelBlockTexts([
    'This is 한글  plain text, just like a <textarea>!',
  ]);
  await editor.assert.renderedBlockText(
    0,
    'This is 한글  plain text, just like a <textarea>!'
  );
  await editor.assert.collapsedModelDOMSelection({
    offset: 11,
    path: [0, 0],
    text: 'This is 한글  plain text, just like a <textarea>!',
  });

  const committedTrace = await device.trace();
  const committed = committedTrace.filter((entry) => entry.seq > firstSeq);

  expect(
    committed
      .filter((entry) => entry.type === 'compositionend')
      .map((entry) => entry.data)
  ).toEqual(['한글']);

  await device.keyboard.type('ㅎㅏㄴ');
  await editor.assert.modelBlockTexts([
    'This is 한글  plain text, just like a <textarea>!',
  ]);
  await editor.assert.renderedBlockText(
    0,
    'This is 한글 한 plain text, just like a <textarea>!'
  );
  await device.keyboard.type(' ');
  await editor.assert.modelBlockTexts([
    'This is 한글 한  plain text, just like a <textarea>!',
  ]);
  await editor.assert.renderedBlockText(
    0,
    'This is 한글 한  plain text, just like a <textarea>!'
  );
  await editor.assert.collapsedModelDOMSelection({
    offset: 13,
    path: [0, 0],
    text: 'This is 한글 한  plain text, just like a <textarea>!',
  });
  expect(device.keyboard.shown()).toBe(true);

  const followUpTrace = await device.trace();
  const followUp = followUpTrace.filter((entry) => entry.seq > firstSeq);

  expect(
    followUp
      .filter((entry) => entry.type === 'compositionend')
      .map((entry) => entry.data)
  ).toEqual(['한글', '한']);
  await info.attach('replacement-follow-up', {
    body: JSON.stringify({
      events: followUp,
      model: await editor.get.modelBlockTexts(),
      snapshot: await editor.snapshot(),
    }),
    contentType: 'application/json',
  });
});
