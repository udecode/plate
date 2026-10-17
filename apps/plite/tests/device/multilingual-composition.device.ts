import { type DeviceLane, expect, test } from '@platejs/test/device';

import { blocks } from './device-reads';

const conversions = [
  {
    language: 'ja',
    keys: 'nihon',
    candidate: '日本。ニチヨウビ ノ ニチ，ヒ。ホンモノ ノ ホン，モト',
    committed: '日本',
    preedit: ['ｎ', 'に', 'にｈ', 'にほ', 'にほｎ'],
    afterDelete: '日',
    followUp: '日日本',
  },
  {
    language: 'zh',
    keys: 'nihao',
    candidate: '你好',
    committed: '你好',
    preedit: ['', '', '', '', ''],
    afterDelete: '你',
    followUp: '你你好',
  },
] as const;

const openTarget = async ({
  device,
  language,
  position,
  route,
}: {
  device: DeviceLane;
  language: 'en' | 'ja' | 'zh';
  position: 'empty' | 'line-end';
  route: 'custom-placeholder' | 'homepage' | 'plaintext';
}) => {
  const editor =
    route === 'homepage'
      ? await device.openWww('/')
      : await device.openExample(route);
  let index = route === 'homepage' ? 1 : 0;
  let path = route === 'homepage' ? [1, 4] : [0, 0];
  let prefix =
    route === 'homepage'
      ? "Experience a modern rich-text editor built with React. This playground showcases just a part of Plate's capabilities. Explore the documentation to discover more."
      : route === 'plaintext'
        ? 'This is editable plain text, just like a <textarea>!'
        : '';
  let leafPrefix = route === 'homepage' ? ' to discover more.' : prefix;
  let renderedPrefix =
    route === 'homepage'
      ? "Experience a modern rich-text editor built with \u00A0React\u00A0. This playground showcases just a part of Plate's capabilities. \u00A0Explore the documentation\u00A0 to discover more."
      : prefix;

  await editor.assert.modelBlockText(index, prefix);
  if (route === 'homepage') await device.touch.tapText(' to discover more.');
  await editor.touch.tap({ offset: leafPrefix.length, path });
  await device.keyboard.use(language);
  if (position === 'empty' && route !== 'custom-placeholder') {
    await device.keyboard.type('\n');
    index += 1;
    path = [index, 0];
    prefix = '';
    leafPrefix = '';
    renderedPrefix = '';
  }
  await editor.assert.modelBlockText(index, prefix);
  if (route === 'custom-placeholder') {
    await editor.assert.placeholderVisible(true);
    await editor.assert.placeholderShape({
      hasBr: true,
      hasFEFF: false,
      kind: 'n',
    });
    await editor.assert.renderedDOMShape({
      blockIndex: index,
      zeroWidthBreakCount: 1,
      zeroWidthCount: 1,
    });
  } else {
    await editor.assert.renderedBlockText(index, renderedPrefix);
  }
  await editor.assert.collapsedModelDOMSelection({
    offset: leafPrefix.length,
    path,
    text: leafPrefix,
  });
  return { editor, index, leafPrefix, path, prefix, renderedPrefix };
};

for (const row of conversions) {
  test(`Gboard ${row.language} plain contenteditable native control`, async ({
    device,
  }, info) => {
    test.skip(
      !device.keyboard.languages.includes(row.language),
      `Request ${row.language} with PLATE_DEVICE_LANGUAGES during setup and calibration.`
    );
    const control = await device.openControl();

    await device.keyboard.use(row.language);
    for (const [index, key] of [...row.keys].entries()) {
      await device.keyboard.type(key);
      const text = row.preedit[index];

      expect(await control.read()).toEqual({
        anchorOffset: text.length,
        collapsed: true,
        focused: true,
        focusOffset: text.length,
        text,
      });
      await info.attach(`preedit-${index}`, {
        body: JSON.stringify({
          state: await control.read(),
          events: await device.trace(),
        }),
        contentType: 'application/json',
      });
    }
    await device.tapStrip(row.candidate);
    expect(await control.read()).toEqual({
      anchorOffset: 2,
      collapsed: true,
      focused: true,
      focusOffset: 2,
      text: row.committed,
    });
    await device.keyboard.type('\b');
    if (row.language === 'zh') {
      expect(await control.read()).toEqual({
        anchorOffset: 2,
        collapsed: true,
        focused: true,
        focusOffset: 2,
        text: '你好',
      });
      await info.attach('prediction-dismissal', {
        body: JSON.stringify({
          state: await control.read(),
          events: await device.trace(),
        }),
        contentType: 'application/json',
      });
      await device.keyboard.type('\b');
    }
    expect(await control.read()).toEqual({
      anchorOffset: 1,
      collapsed: true,
      focused: true,
      focusOffset: 1,
      text: row.afterDelete,
    });
    await device.keyboard.type(row.keys);
    await device.tapStrip(row.candidate);
    expect(await control.read()).toEqual({
      anchorOffset: 3,
      collapsed: true,
      focused: true,
      focusOffset: 3,
      text: row.followUp,
    });
    await info.attach('follow-up-commit', {
      body: JSON.stringify({
        state: await control.read(),
        events: await device.trace(),
      }),
      contentType: 'application/json',
    });
  });

  for (const route of [
    'homepage',
    'plaintext',
    'custom-placeholder',
  ] as const) {
    for (const position of ['empty', 'line-end'] as const) {
      test(`Gboard ${row.language} converts at the ${route} ${position}, deletes and keeps typing`, async ({
        device,
      }, info) => {
        test.skip(
          !device.keyboard.languages.includes(row.language),
          `Request ${row.language} with PLATE_DEVICE_LANGUAGES during setup and calibration.`
        );
        test.skip(
          route === 'homepage' && !device.www,
          'Set PLATE_DEVICE_WWW_PORT to the homepage server.'
        );
        const target = await openTarget({
          device,
          language: row.language,
          position,
          route,
        });
        const { editor, index, path } = target;
        let { prefix, leafPrefix, renderedPrefix } = target;

        if (route === 'custom-placeholder' && position === 'line-end') {
          await device.keyboard.type(row.keys);
          await device.tapStrip(row.candidate);
          prefix = row.committed;
          leafPrefix = row.committed;
          renderedPrefix = row.committed;
          await editor.assert.modelBlockTexts([row.committed]);
          await editor.assert.collapsedModelDOMSelection({
            offset: 2,
            path,
            text: row.committed,
          });
        }
        const before = await editor.get.modelBlockTexts();
        const beforeTrace = await device.trace();
        const firstSeq = beforeTrace.at(-1)?.seq ?? 0;

        for (const [keyIndex, key] of [...row.keys].entries()) {
          await device.keyboard.type(key);
          await editor.assert.modelBlockTexts(before);
          if (route === 'custom-placeholder') {
            if (row.language === 'ja') {
              await editor.assert.placeholderVisible(false);
              await editor.assert.renderedDOMShape({
                blockIndex: index,
                innerText: renderedPrefix + row.preedit[keyIndex],
              });
            } else if (position === 'empty') {
              await editor.assert.placeholderVisible(true);
              await editor.assert.placeholderShape({
                hasBr: true,
                hasFEFF: false,
                kind: 'n',
              });
              await editor.assert.renderedDOMShape({
                blockIndex: index,
                zeroWidthBreakCount: 1,
                zeroWidthCount: 1,
              });
            } else {
              await editor.assert.renderedBlockText(
                index,
                renderedPrefix + row.preedit[keyIndex]
              );
            }
          } else {
            await editor.assert.renderedBlockText(
              index,
              renderedPrefix + row.preedit[keyIndex]
            );
          }
          await editor.assert.selection({
            anchor: { offset: leafPrefix.length, path },
            focus: { offset: leafPrefix.length, path },
          });
          await editor.assert.domSelectionTarget({
            anchorPath: path,
            isCollapsed: true,
          });
          const trace = await device.trace();
          const events = trace.filter((entry) => entry.seq > firstSeq);

          if (row.language === 'ja') {
            expect(
              events.some((entry) => entry.type === 'compositionstart')
            ).toBe(true);
            expect(
              events.filter((entry) => entry.type === 'compositionend')
            ).toEqual([]);
            expect(
              events.findLast((entry) => entry.type === 'input')?.isComposing
            ).toBe(true);
          } else {
            expect(events.filter((entry) => entry.type !== 'keydown')).toEqual(
              []
            );
          }
          if (route === 'custom-placeholder' && position === 'empty') {
            await editor.assert.placeholderVisible(row.language === 'zh');
          }
          await info.attach(`preedit-${keyIndex}`, {
            body: JSON.stringify({
              events,
              model: await editor.get.modelBlockTexts(),
              snapshot: await editor.snapshot(),
            }),
            contentType: 'application/json',
          });
        }
        await device.tapStrip(row.candidate);
        await editor.assert.modelBlockText(index, prefix + row.committed);
        await editor.assert.renderedBlockText(
          index,
          renderedPrefix + row.committed
        );
        await editor.assert.collapsedModelDOMSelection({
          offset: leafPrefix.length + 2,
          path,
          text: leafPrefix + row.committed,
        });
        await info.attach('candidate-commit', {
          body: JSON.stringify({
            events: await device.trace(),
            model: await editor.get.modelBlockTexts(),
            snapshot: await editor.snapshot(),
          }),
          contentType: 'application/json',
        });
        await device.keyboard.type('\b');
        if (row.language === 'zh') {
          await editor.assert.modelBlockText(index, `${prefix}你好`);
          await editor.assert.renderedBlockText(index, `${renderedPrefix}你好`);
          await editor.assert.collapsedModelDOMSelection({
            offset: leafPrefix.length + 2,
            path,
            text: `${leafPrefix}你好`,
          });
          await info.attach('prediction-dismissal', {
            body: JSON.stringify({
              events: await device.trace(),
              model: await editor.get.modelBlockTexts(),
              snapshot: await editor.snapshot(),
            }),
            contentType: 'application/json',
          });
          await device.keyboard.type('\b');
        }
        await editor.assert.modelBlockText(index, prefix + row.afterDelete);
        await editor.assert.renderedBlockText(
          index,
          renderedPrefix + row.afterDelete
        );
        await editor.assert.collapsedModelDOMSelection({
          offset: leafPrefix.length + 1,
          path,
          text: leafPrefix + row.afterDelete,
        });
        await device.keyboard.type(row.keys);
        await device.tapStrip(row.candidate);
        await editor.assert.modelBlockText(index, prefix + row.followUp);
        await editor.assert.renderedBlockText(
          index,
          renderedPrefix + row.followUp
        );
        await editor.assert.collapsedModelDOMSelection({
          offset: leafPrefix.length + 3,
          path,
          text: leafPrefix + row.followUp,
        });
        expect(await editor.get.modelBlockTexts()).toHaveLength(before.length);
        if (route === 'custom-placeholder') {
          await device.keyboard.type('\n');
          await editor.assert.modelBlockTexts([prefix + row.followUp, '']);
          await editor.assert.collapsedModelDOMSelection({
            offset: 0,
            path: [1, 0],
            text: '',
          });
          await device.keyboard.type(row.keys);
          await device.tapStrip(row.candidate);
          await editor.assert.modelBlockTexts([
            prefix + row.followUp,
            row.committed,
          ]);
          await editor.assert.renderedBlockText(1, row.committed);
          await editor.assert.collapsedModelDOMSelection({
            offset: 2,
            path: [1, 0],
            text: row.committed,
          });
        }
        expect(device.keyboard.shown()).toBe(true);
        await info.attach('follow-up', {
          body: JSON.stringify({
            events: await device.trace(),
            model: await editor.get.modelBlockTexts(),
            snapshot: await editor.snapshot(),
          }),
          contentType: 'application/json',
        });
      });
    }
  }
}

test('Gboard ko plain contenteditable composes and commits each word once with Space', async ({
  device,
}, info) => {
  test.skip(
    !device.keyboard.languages.includes('ko'),
    'Request ko with PLATE_DEVICE_LANGUAGES during setup and calibration.'
  );
  const control = await device.openControl();

  await device.keyboard.use('ko');
  for (const row of [
    { key: 'ㅎ', text: 'ㅎ' },
    { key: 'ㅏ', text: '하' },
    { key: 'ㄴ', text: '한' },
    { key: 'ㄱ', text: '한ㄱ' },
    { key: 'ㅡ', text: '한그' },
    { key: 'ㄹ', text: '한글' },
  ]) {
    await device.keyboard.type(row.key);
    expect(await control.read()).toEqual({
      anchorOffset: row.text.length,
      collapsed: true,
      focused: true,
      focusOffset: row.text.length,
      text: row.text,
    });
    const events = await device.trace();

    expect(
      events.filter((entry) => entry.type === 'compositionstart')
    ).toHaveLength(1);
    expect(events.filter((entry) => entry.type === 'compositionend')).toEqual(
      []
    );
    expect(events.findLast((entry) => entry.type === 'input')).toMatchObject({
      data: row.text,
      inputType: 'insertCompositionText',
      isComposing: true,
      isTrusted: true,
    });
    await info.attach(`korean-preedit-${row.key}`, {
      body: JSON.stringify({ events, state: await control.read() }),
      contentType: 'application/json',
    });
  }
  for (const row of [
    {
      keys: ' ',
      text: '한글\u00A0',
      committed: ['한글'],
      data: ' ',
      inputType: 'insertText',
      isComposing: false,
      starts: 1,
    },
    {
      keys: 'ㅎㅏㄴ',
      text: '한글 한',
      committed: ['한글'],
      data: '한',
      inputType: 'insertCompositionText',
      isComposing: true,
      starts: 2,
    },
    {
      keys: ' ',
      text: '한글 한\u00A0',
      committed: ['한글', '한'],
      data: ' ',
      inputType: 'insertText',
      isComposing: false,
      starts: 2,
    },
  ]) {
    await device.keyboard.type(row.keys);
    expect(await control.read()).toEqual({
      anchorOffset: row.text.length,
      collapsed: true,
      focused: true,
      focusOffset: row.text.length,
      text: row.text,
    });
    const events = await device.trace();

    expect(
      events.filter((entry) => entry.type === 'compositionstart')
    ).toHaveLength(row.starts);
    expect(
      events
        .filter((entry) => entry.type === 'compositionend')
        .map((entry) => entry.data)
    ).toEqual(row.committed);
    expect(events.findLast((entry) => entry.type === 'input')).toMatchObject({
      data: row.data,
      inputType: row.inputType,
      isComposing: row.isComposing,
      isTrusted: true,
    });
    await info.attach(`korean-word-${device.steps().length}`, {
      body: JSON.stringify({ events, state: await control.read() }),
      contentType: 'application/json',
    });
  }
});

test('Gboard ja plain contenteditable commits active Enter before the next native Enter and composing key', async ({
  device,
}, info) => {
  test.skip(
    !device.keyboard.languages.includes('ja'),
    'Request ja with PLATE_DEVICE_LANGUAGES during setup and calibration.'
  );
  const control = await device.openControl();

  await device.keyboard.use('ja');
  for (const row of [
    { key: 'n', text: 'ｎ' },
    { key: 'i', text: 'に' },
    { key: 'h', text: 'にｈ' },
    { key: 'o', text: 'にほ' },
    { key: 'n', text: 'にほｎ' },
  ]) {
    await device.keyboard.type(row.key);
    expect(await control.read()).toEqual({
      anchorOffset: row.text.length,
      collapsed: true,
      focused: true,
      focusOffset: row.text.length,
      text: row.text,
    });
  }
  const preedit = await device.trace();

  expect(
    preedit.filter((entry) => entry.type === 'compositionstart')
  ).toHaveLength(1);
  expect(preedit.filter((entry) => entry.type === 'compositionend')).toEqual(
    []
  );
  expect(preedit.findLast((entry) => entry.type === 'input')).toMatchObject({
    data: 'にほｎ',
    inputType: 'insertCompositionText',
    isComposing: true,
    isTrusted: true,
  });
  await info.attach('japanese-active-preedit', {
    body: JSON.stringify({ events: preedit, state: await control.read() }),
    contentType: 'application/json',
  });
  for (const row of [
    {
      keys: '\n',
      name: 'active-enter-commit',
      text: 'にほｎ',
      offset: 3,
      data: 'にほｎ',
      inputType: 'insertCompositionText',
      isComposing: true,
      paragraphs: 0,
      starts: 1,
    },
    {
      keys: '\n',
      name: 'next-native-enter',
      text: 'にほｎ',
      offset: 0,
      data: null,
      inputType: 'insertParagraph',
      isComposing: false,
      paragraphs: 1,
      starts: 1,
    },
    {
      keys: 'a',
      name: 'next-composing-key',
      text: 'にほｎあ',
      offset: 1,
      data: 'あ',
      inputType: 'insertCompositionText',
      isComposing: true,
      paragraphs: 1,
      starts: 2,
    },
  ]) {
    await device.keyboard.type(row.keys);
    expect(await control.read()).toEqual({
      anchorOffset: row.offset,
      collapsed: true,
      focused: true,
      focusOffset: row.offset,
      text: row.text,
    });
    const events = await device.trace();

    expect(
      events
        .filter((entry) => entry.type === 'compositionend')
        .map((entry) => entry.data)
    ).toEqual(['にほｎ']);
    expect(
      events.filter((entry) => entry.type === 'compositionstart')
    ).toHaveLength(row.starts);
    expect(
      events.filter(
        (entry) =>
          entry.type === 'input' && entry.inputType === 'insertParagraph'
      )
    ).toHaveLength(row.paragraphs);
    expect(events.findLast((entry) => entry.type === 'input')).toMatchObject({
      data: row.data,
      inputType: row.inputType,
      isComposing: row.isComposing,
      isTrusted: true,
    });
    await info.attach(`japanese-${row.name}`, {
      body: JSON.stringify({ events, state: await control.read() }),
      contentType: 'application/json',
    });
  }
});

test('Gboard ja commits active Enter under the placeholder, splits on the next Enter and keeps composing', async ({
  device,
}, info) => {
  test.skip(
    !device.keyboard.languages.includes('ja'),
    'Request ja with PLATE_DEVICE_LANGUAGES during setup and calibration.'
  );
  const { editor } = await openTarget({
    device,
    language: 'ja',
    position: 'empty',
    route: 'custom-placeholder',
  });

  await device.keyboard.type('nihon');
  await editor.assert.modelBlockTexts(['']);
  await editor.assert.placeholderVisible(false);
  await editor.assert.renderedDOMShape({ blockIndex: 0, innerText: 'にほｎ' });
  await editor.assert.selection({
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  });
  await editor.assert.domCaret({ offset: 3, text: 'にほｎ' });
  const preedit = await device.trace();

  expect(preedit.filter((entry) => entry.type === 'compositionend')).toEqual(
    []
  );
  expect(preedit.findLast((entry) => entry.type === 'input')).toMatchObject({
    data: 'にほｎ',
    inputType: 'insertCompositionText',
    isComposing: true,
    isTrusted: true,
  });
  await info.attach('japanese-placeholder-preedit', {
    body: JSON.stringify({
      events: preedit,
      model: await editor.get.modelBlockTexts(),
      snapshot: await editor.snapshot(),
    }),
    contentType: 'application/json',
  });
  for (const row of [
    {
      keys: '\n',
      name: 'active-enter-commit',
      blocks: ['にほｎ'],
      index: 0,
      text: 'にほｎ',
      modelOffset: 3,
      domOffset: 3,
      committed: ['にほｎ'],
    },
    {
      keys: '\n',
      name: 'second-enter-split',
      blocks: ['にほｎ', ''],
      index: 1,
      text: '',
      modelOffset: 0,
      domOffset: 0,
      committed: ['にほｎ'],
    },
    {
      keys: 'a',
      name: 'next-composing-key',
      blocks: ['にほｎ', ''],
      index: 1,
      text: 'あ',
      modelOffset: 0,
      domOffset: 1,
      committed: ['にほｎ'],
    },
    {
      keys: '\n',
      name: 'follow-up-commit',
      blocks: ['にほｎ', 'あ'],
      index: 1,
      text: 'あ',
      modelOffset: 1,
      domOffset: 1,
      committed: ['にほｎ', 'あ'],
    },
  ]) {
    await device.keyboard.type(row.keys);
    await editor.assert.modelBlockTexts(row.blocks);
    await editor.assert.renderedBlockText(row.index, row.text);
    await editor.assert.selection({
      anchor: { offset: row.modelOffset, path: [row.index, 0] },
      focus: { offset: row.modelOffset, path: [row.index, 0] },
    });
    if (row.text === '') {
      await editor.assert.placeholderShape({
        hasBr: true,
        hasFEFF: false,
        kind: 'n',
      });
      await editor.assert.domSelection({
        anchorNodeText: '',
        anchorOffset: 0,
        focusNodeText: '',
        focusOffset: 0,
      });
    } else {
      await editor.assert.domCaret({ offset: row.domOffset, text: row.text });
    }
    await editor.assert.domSelectionTarget({
      anchorPath: [row.index, 0],
      isCollapsed: true,
    });
    if (row.modelOffset === row.domOffset) {
      await editor.assert.collapsedModelDOMSelection({
        offset: row.modelOffset,
        path: [row.index, 0],
        text: row.text,
      });
    }
    const events = await device.trace();

    expect(
      events
        .filter((entry) => entry.type === 'compositionend')
        .map((entry) => entry.data)
    ).toEqual(row.committed);
    expect(device.keyboard.shown()).toBe(true);
    await info.attach(`japanese-placeholder-${row.name}`, {
      body: JSON.stringify({
        events,
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });
  }
});

test('Gboard en plain contenteditable autocorrect control', async ({
  device,
}, info) => {
  test.skip(
    !device.keyboard.languages.includes('en'),
    'Request en with PLATE_DEVICE_LANGUAGES during setup and calibration.'
  );
  const control = await device.openControl();

  await device.keyboard.use('en');
  for (const row of [
    { keys: 'becuase', text: 'Becuase' },
    { keys: ' ', text: 'Because\u00A0' },
    { keys: 'go', text: 'Because go' },
    { keys: ' ', text: 'Because go\u00A0' },
  ]) {
    await device.keyboard.type(row.keys);
    expect(await control.read()).toEqual({
      anchorOffset: row.text.length,
      collapsed: true,
      focused: true,
      focusOffset: row.text.length,
      text: row.text,
    });
    await info.attach(`autocorrect-${device.steps().length}`, {
      body: JSON.stringify({
        state: await control.read(),
        events: await device.trace(),
      }),
      contentType: 'application/json',
    });
  }
});

for (const trigger of ['/', '# '] as const) {
  test(`Gboard English ${JSON.stringify(trigger)} creates a homepage heading and keeps typing`, async ({
    device,
  }, info) => {
    test.skip(
      !device.keyboard.languages.includes('en'),
      'Request en with PLATE_DEVICE_LANGUAGES during setup and calibration.'
    );
    test.skip(!device.www, 'Set PLATE_DEVICE_WWW_PORT to the homepage server.');
    const { editor } = await openTarget({
      device,
      language: 'en',
      position: 'empty',
      route: 'homepage',
    });

    await device.keyboard.type(trigger);
    if (trigger === '/') {
      await editor.assert.modelBlockText(2, '/');
      await editor.assert.renderedBlockText(2, '/');
      await device.touch.tapText('Heading 1');
    }
    await editor.assert.modelBlockText(2, '');
    const value = await blocks(editor);

    expect(value[2]).toMatchObject({
      level: 1,
      type: 'heading',
    });
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [2, 0],
      text: '',
    });
    await device.keyboard.type('1');
    await editor.assert.modelBlockText(2, '1');
    await editor.assert.renderedBlockText(2, '1');
    await editor.assert.collapsedModelDOMSelection({
      offset: 1,
      path: [2, 0],
      text: '1',
    });
    expect(device.keyboard.shown()).toBe(true);
    await info.attach('english-trigger-events', {
      body: JSON.stringify({
        events: await device.trace(),
        model: await editor.get.modelBlockTexts(),
        snapshot: await editor.snapshot(),
      }),
      contentType: 'application/json',
    });
  });
}
