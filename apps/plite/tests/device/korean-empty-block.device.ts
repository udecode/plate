import { expect, test } from '@platejs/test/device';

test('Gboard Korean keeps the homepage draft through each jamo and commits it on Space', async ({
  device,
}, info) => {
  const editor = await device.openWww('/');

  await device.touch.tapText(' to discover more.');
  await editor.touch.tap({ offset: ' to discover more.'.length, path: [1, 4] });
  await device.keyboard.use('ko');
  await device.keyboard.type('\n');
  await editor.assert.modelBlockText(2, '');
  await editor.assert.renderedBlockText(2, '');
  await editor.assert.collapsedModelDOMSelection({
    offset: 0,
    path: [2, 0],
    text: '',
  });

  const before = await editor.get.modelBlockTexts();
  const beforeTrace = await device.trace();
  const firstSeq = beforeTrace.at(-1)?.seq ?? 0;

  for (const step of [
    { key: 'ㅎ', text: 'ㅎ' },
    { key: 'ㅏ', text: '하' },
    { key: 'ㄴ', text: '한' },
    { key: 'ㄱ', text: '한ㄱ' },
    { key: 'ㅡ', text: '한그' },
    { key: 'ㄹ', text: '한글' },
  ]) {
    await device.keyboard.type(step.key);

    const trace = await device.trace();
    const events = trace.filter((entry) => entry.seq > firstSeq);

    await info.attach(`preedit-${step.text}`, {
      body: JSON.stringify({
        events,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });
    await editor.assert.renderedBlockText(2, step.text);
    expect(await editor.get.modelBlockTexts()).toEqual(before);
    expect(events.some((entry) => entry.type === 'compositionstart')).toBe(
      true
    );
    expect(events.filter((entry) => entry.type === 'compositionend')).toEqual(
      []
    );
    expect(
      events.findLast((entry) => entry.type === 'input')?.isComposing
    ).toBe(true);
    await editor.assert.selection({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
    await editor.assert.domSelectionTarget({
      anchorPath: [2, 0],
      isCollapsed: true,
    });
  }

  await device.keyboard.type(' ');
  await editor.assert.modelBlockText(2, '한글 ');
  await editor.assert.renderedBlockText(2, '한글 ');
  await editor.assert.collapsedModelDOMSelection({
    offset: 3,
    path: [2, 0],
    text: '한글 ',
  });

  const trace = await device.trace();
  const committed = trace.filter((entry) => entry.seq > firstSeq);

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
  await editor.assert.renderedBlockText(2, '한글 한');
  await editor.assert.modelBlockText(2, '한글 ');
  await device.keyboard.type(' ');
  await editor.assert.modelBlockText(2, '한글 한 ');
  await editor.assert.renderedBlockText(2, '한글 한 ');
  await editor.assert.collapsedModelDOMSelection({
    offset: 5,
    path: [2, 0],
    text: '한글 한 ',
  });
  expect(await editor.get.modelBlockTexts()).toHaveLength(before.length);
  expect(device.keyboard.shown()).toBe(true);
  await info.attach('follow-up-commit', {
    body: JSON.stringify({
      events: await device.trace(),
      model: await editor.get.modelBlockTexts(),
      snapshot: await editor.snapshot(),
    }),
    contentType: 'application/json',
  });
});

for (const route of ['homepage', 'plaintext']) {
  test(`Backspace erases a Korean draft without merging the new ${route} paragraph`, async ({
    device,
  }, info) => {
    const editor =
      route === 'homepage'
        ? await device.openWww('/')
        : await device.openExample('plaintext');
    const blockIndex = route === 'homepage' ? 2 : 1;
    const precedingText =
      route === 'homepage'
        ? "Experience a modern rich-text editor built with React. This playground showcases just a part of Plate's capabilities. Explore the documentation to discover more."
        : 'This is editable plain text, just like a <textarea>!';

    await editor.assert.modelBlockText(blockIndex - 1, precedingText);
    if (route === 'homepage') {
      await device.touch.tapText(' to discover more.');
    }
    await editor.touch.tap({
      offset:
        route === 'homepage'
          ? ' to discover more.'.length
          : precedingText.length,
      path: route === 'homepage' ? [1, 4] : [0, 0],
    });
    await device.keyboard.use('ko');
    await device.keyboard.type('\n');
    await editor.assert.modelBlockText(blockIndex, '');
    await editor.assert.renderedBlockText(blockIndex, '');
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [blockIndex, 0],
      text: '',
    });

    const emptyBlocks = await editor.get.modelBlockTexts();
    const beforeTrace = await device.trace();
    const firstSeq = beforeTrace.at(-1)?.seq ?? 0;

    await device.keyboard.type('ㅎ');
    await editor.assert.renderedBlockText(blockIndex, 'ㅎ');
    expect(await editor.get.modelBlockTexts()).toEqual(emptyBlocks);

    const trace = await device.trace();
    const preedit = trace.filter((entry) => entry.seq > firstSeq);

    expect(preedit.some((entry) => entry.type === 'compositionstart')).toBe(
      true
    );
    expect(preedit.filter((entry) => entry.type === 'compositionend')).toEqual(
      []
    );
    await info.attach('before-backspace', {
      body: JSON.stringify({
        events: preedit,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });

    await device.keyboard.type('\b');
    await editor.assert.modelBlockTexts(emptyBlocks);
    await editor.assert.modelBlockText(blockIndex - 1, precedingText);
    await editor.assert.renderedBlockText(blockIndex, '');
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [blockIndex, 0],
      text: '',
    });
    await info.attach('after-backspace', {
      body: JSON.stringify({
        events: await device.trace(),
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });

    await device.keyboard.type('ㅎㅏㄴ');
    await editor.assert.renderedBlockText(blockIndex, '한');
    await editor.assert.modelBlockTexts(emptyBlocks);
    await device.keyboard.type(' ');
    await editor.assert.modelBlockText(blockIndex - 1, precedingText);
    await editor.assert.modelBlockText(blockIndex, '한 ');
    await editor.assert.renderedBlockText(blockIndex, '한 ');
    await editor.assert.collapsedModelDOMSelection({
      offset: 2,
      path: [blockIndex, 0],
      text: '한 ',
    });
    expect(await editor.get.modelBlockTexts()).toHaveLength(emptyBlocks.length);
    expect(device.keyboard.shown()).toBe(true);
    await info.attach('follow-up-commit', {
      body: JSON.stringify({
        events: await device.trace(),
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });
  });
}
