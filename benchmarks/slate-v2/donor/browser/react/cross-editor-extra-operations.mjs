import assert from 'node:assert/strict';

export const extraOperations = [
  'move-right',
  'word-left',
  'word-right',
  'line-start',
  'line-end',
  'document-start',
  'document-end',
  'previous-block-end',
  'next-block-start',
  'click-caret',
  'double-click-word',
  'copy-selection',
  'focus-refocus-type',
  'paste-large-text',
  'replace-large-selection',
];

const pointerGestureCompletedAt = new WeakMap();
const pointerGestureGapMs = 550;
const pointerOperations = new Set([
  'click-caret',
  'double-click-word',
  'focus-refocus-type',
]);

const payload = 'large plain text '.repeat(2048).slice(0, 32768);
const point = (block, offset) => ({ block, offset });
const collapsed = (block, offset) => ({
  anchor: point(block, offset),
  focus: point(block, offset),
});
const frames = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
const clipboard = (page, text) =>
  page.evaluate((value) => navigator.clipboard.writeText(value), text);
const unsupported = (reason) => ({
  status: 'unsupported',
  kind: 'unsupported',
  reason,
});

export const runExtraOperation = async ({
  operation,
  page,
  expected,
  browserName,
  hostPlatform,
  select,
  verify,
  verifySelection,
  mutate,
  compact,
}) => {
  const block = Math.max(0, expected.length - 2);
  const line = expected[block];
  const word = /[A-Za-z]{3,}/.exec(line);
  const isMac = hostPlatform === 'darwin';
  const clipboardOperation = [
    'copy-selection',
    'paste-large-text',
    'replace-large-selection',
  ].includes(operation);
  if (clipboardOperation && browserName !== 'chromium')
    return unsupported(
      'This runner only provisions Chromium clipboard permissions; exact clipboard proof is unavailable in this browser lane',
    );
  if (['word-left', 'word-right'].includes(operation) && !isMac)
    return unsupported(
      'The current word-boundary oracle is macOS Option+Arrow on an ASCII word; other platform word rules need their own exact recipe',
    );
  if (
    !word &&
    ['word-left', 'word-right', 'double-click-word', 'copy-selection'].includes(
      operation,
    )
  )
    return unsupported(
      'No three-letter ASCII word exists in the selected paragraph',
    );
  if (line.length < 3)
    return unsupported(
      'This operation requires a paragraph containing at least three characters',
    );
  if (
    ['previous-block-end', 'next-block-start'].includes(operation) &&
    expected.length < 2
  )
    return unsupported('Block-boundary movement requires two paragraphs');

  let from = Math.min(16, line.length - 2);
  let to = from;
  let targetBlock = block;
  let key;
  let expectedSelection;
  let geometry;
  let copiedText;
  const receipt = {
    setup:
      'Current adapter selection outside timer; original document cohort retained',
    platform: hostPlatform,
  };
  if (operation === 'move-right') {
    key = 'ArrowRight';
    expectedSelection = collapsed(block, from + 1);
  } else if (operation === 'word-left' || operation === 'word-right') {
    from = word.index + 1;
    to = from;
    key = operation === 'word-left' ? 'Alt+ArrowLeft' : 'Alt+ArrowRight';
    expectedSelection = collapsed(
      block,
      operation === 'word-left' ? word.index : word.index + word[0].length,
    );
    receipt.word = word[0];
  } else if (operation === 'line-start' || operation === 'line-end') {
    key = isMac
      ? operation === 'line-start'
        ? 'Meta+ArrowLeft'
        : 'Meta+ArrowRight'
      : operation === 'line-start'
        ? 'Home'
        : 'End';
    expectedSelection = collapsed(
      block,
      operation === 'line-start' ? 0 : line.length,
    );
  } else if (operation === 'document-start' || operation === 'document-end') {
    key = isMac
      ? operation === 'document-start'
        ? 'Meta+ArrowUp'
        : 'Meta+ArrowDown'
      : operation === 'document-start'
        ? 'Control+Home'
        : 'Control+End';
    expectedSelection =
      operation === 'document-start'
        ? collapsed(0, 0)
        : collapsed(expected.length - 1, expected.at(-1).length);
  } else if (operation === 'previous-block-end') {
    targetBlock = Math.max(1, block);
    from = to = 0;
    key = 'ArrowLeft';
    expectedSelection = collapsed(
      targetBlock - 1,
      expected[targetBlock - 1].length,
    );
  } else if (operation === 'next-block-start') {
    from = to = line.length;
    key = 'ArrowRight';
    expectedSelection = collapsed(block + 1, 0);
  } else if (
    operation === 'click-caret' ||
    operation === 'focus-refocus-type'
  ) {
    from = to = 1;
    expectedSelection = collapsed(
      block,
      operation === 'focus-refocus-type' ? 2 : 1,
    );
  } else if (operation === 'double-click-word') {
    from = to = word.index + 1;
    expectedSelection = {
      anchor: point(block, word.index),
      focus: point(block, word.index + word[0].length),
    };
  } else if (operation === 'copy-selection') {
    from = word.index;
    to = from + word[0].length;
    copiedText = line.slice(from, to);
    expectedSelection = { anchor: point(block, from), focus: point(block, to) };
    await clipboard(page, 'CROSS_EDITOR_COPY_SENTINEL');
  } else if (operation === 'paste-large-text') {
    await clipboard(page, payload);
    expectedSelection = collapsed(block, from + payload.length);
    receipt.payloadUTF16 = payload.length;
  } else if (operation === 'replace-large-selection') {
    await select(page, expected, block, from);
    await clipboard(page, payload);
    await page.keyboard.press('ControlOrMeta+v');
    mutate(expected, block, from, from, payload);
    await frames(page);
    verify(
      await page.evaluate(() => crossEditor.snapshot()),
      expected,
      'large replacement preparation',
    );
    to = from + payload.length;
    expectedSelection = collapsed(block, from + 'REPLACED'.length);
    receipt.setup =
      'Untimed trusted 32 KiB paste verified in model and DOM; current adapter selects that exact inserted range';
    receipt.replacedUTF16 = payload.length;
  }
  if (pointerOperations.has(operation)) {
    const previous = pointerGestureCompletedAt.get(page);
    const waitMs =
      previous === undefined
        ? 0
        : Math.max(0, pointerGestureGapMs - (Date.now() - previous));
    if (waitMs > 0) await page.waitForTimeout(waitMs);
    receipt.pointerGesturePreparation = {
      minimumGapMs: pointerGestureGapMs,
      waitedMs: waitMs,
      reason:
        'Independent gesture; preserve the current view 500 ms multi-click grouping rule',
    };
  }
  receipt.selectionSetup =
    operation === 'click-caret'
      ? await select(page, expected, targetBlock, Math.min(line.length - 1, 3))
      : await select(page, expected, targetBlock, from, to);
  if (
    [
      'line-start',
      'line-end',
      'click-caret',
      'double-click-word',
      'focus-refocus-type',
    ].includes(operation)
  ) {
    geometry = await page.evaluate(
      ([block, offset]) => crossEditor.textGeometry(block, offset),
      [targetBlock, from],
    );
    receipt.geometry = geometry;
    if (
      ['line-start', 'line-end'].includes(operation) &&
      geometry.visualLines !== 1
    )
      return unsupported(
        `Visual-line oracle requires one measured line; this paragraph occupies ${geometry.visualLines} lines`,
      );
  }
  await page.evaluate(
    (documentEvents) => crossEditor.arm({ documentEvents }),
    operation === 'focus-refocus-type',
  );
  if (key) await page.keyboard.press(key);
  else if (operation === 'click-caret')
    await page.mouse.click(geometry.x, geometry.y);
  else if (operation === 'double-click-word')
    await page.mouse.dblclick(geometry.x, geometry.y);
  else if (operation === 'copy-selection')
    await page.keyboard.press('ControlOrMeta+c');
  else if (operation === 'focus-refocus-type') {
    await page.locator('#cross-editor-blur-target').click();
    assert.equal(
      await page.evaluate(() => crossEditor.snapshot().focused),
      false,
      'Blur target did not remove editor focus',
    );
    await page.mouse.click(geometry.x, geometry.y);
    await page.keyboard.type('R');
    mutate(expected, block, from, from, 'R');
  } else if (operation === 'paste-large-text') {
    await page.keyboard.press('ControlOrMeta+v');
    mutate(expected, block, from, from, payload);
  } else if (operation === 'replace-large-selection') {
    await page.keyboard.type('REPLACED');
    mutate(expected, block, from, to, 'REPLACED');
  } else throw new Error(`Unimplemented extra operation: ${operation}`);
  if (pointerOperations.has(operation))
    pointerGestureCompletedAt.set(page, Date.now());
  const result = await page.evaluate(
    (selection) => crossEditor.finish(selection),
    expectedSelection,
  );
  verify(result, expected, operation);
  verifySelection(result, expectedSelection);
  if (operation === 'double-click-word')
    assert.equal(
      result.nativeSelection.text,
      word[0],
      'Double click selected a different word or included trailing whitespace',
    );
  if (operation === 'copy-selection') {
    assert(
      result.events.some((event) => event.type === 'copy' && event.isTrusted),
      'Missing trusted copy event',
    );
    const text = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(
      text,
      copiedText,
      'Exact clipboard text differs; no whitespace normalization is allowed',
    );
    receipt.clipboardText = text;
  }
  if (operation === 'paste-large-text')
    assert(
      result.events.some((event) => event.type === 'paste' && event.isTrusted),
      'Missing trusted paste event',
    );
  if (
    ['click-caret', 'double-click-word', 'focus-refocus-type'].includes(
      operation,
    )
  )
    assert(
      result.events.some(
        (event) => event.type === 'pointerdown' && event.isTrusted,
      ),
      'Missing trusted pointer event',
    );
  if (!['click-caret', 'double-click-word'].includes(operation))
    assert(
      result.events.some(
        (event) => event.type === 'keydown' && event.isTrusted,
      ),
      'Missing trusted keyboard event',
    );
  if (operation === 'focus-refocus-type') {
    assert.equal(result.focused, true, 'Editor did not regain focus');
    assert(
      result.events.some(
        (event) => event.type === 'focusout' && event.isTrusted,
      ),
      'Missing trusted blur transition',
    );
  }
  return {
    ...compact(result),
    status: 'pass',
    kind: 'trusted-browser',
    recipe: { ...receipt, key },
  };
};
