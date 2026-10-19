import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, type Locator, test, type Page } from '@playwright/test';
import type { EditorDocumentValue } from 'platejs';

const ROUTE = '/blocks/list-demo';

type Block = {
  checked?: boolean;
  children?: Array<{ text?: string }>;
  indent?: number;
  listType?: string;
};

const openListDemo = async (page: Page, caseId: string) => {
  await page.goto(ROUTE, { waitUntil: 'commit' });

  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, caseId, root);

  await editor.ready({ editor: 'visible' });

  const blocks = async () =>
    ((await editor.get.modelValue()) as { children: Block[] }).children.map(
      (block) => ({
        checked: block.checked,
        indent: block.indent,
        listType: block.listType,
        text: block.children?.map((child) => child.text ?? '').join(''),
      })
    );

  return { blocks, editor, root };
};

test('list keys: Shift+Tab keeps a clicked root item and leaves no undo step', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { blocks, root } = await openListDemo(page, 'list-keys:root-untab');

    await root.getByText('Roman 1', { exact: true }).click();
    await page.keyboard.press('End');
    await page.keyboard.type('z');
    await page.keyboard.press('Shift+Tab');

    await expect
      .poll(async () => {
        const value = await blocks();

        return value.find((block) => block.text === 'Roman 1z');
      })
      .toMatchObject({ indent: 1, listType: 'numbered' });

    await page.keyboard.press('ControlOrMeta+z');

    await expect
      .poll(async () => {
        const value = await blocks();

        return value.find((block) => block.text?.startsWith('Roman 1'));
      })
      .toMatchObject({ indent: 1, listType: 'numbered', text: 'Roman 1' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list keys: Enter at the end of a checked task keeps the new task checked [EDIT-TASK-ENTER-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { blocks, root } = await openListDemo(page, 'list-keys:task-enter');

    await root.getByText('Todo 1', { exact: true }).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await expect
      .poll(async () => {
        const value = await blocks();
        const index = value.findIndex((b) => b.text === 'Todo 1');

        return value[index + 1];
      })
      .toMatchObject({ checked: true, listType: 'task', text: '' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list clipboard: copied sibling items remain peers through paste and history', async ({
  browserName,
  page,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'Native clipboard permissions');
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  const { blocks, editor, root } = await openListDemo(page, 'list-clipboard');

  await startBrowserNativeEventTrace(root);

  try {
    await editor.selection.selectDOM({
      anchor: { offset: 0, path: [8, 0] },
      focus: { offset: 11, path: [9, 0] },
    });
    await editor.focus();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('Decimal 111\nDecimal 112');
    await page.keyboard.press('ControlOrMeta+C');
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('    1. Decimal 111\n    2. Decimal 112');

    await editor.selection.selectDOM({
      anchor: { offset: 7, path: [15, 0] },
      focus: { offset: 7, path: [15, 0] },
    });
    await page.keyboard.press('Enter');
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [16, 0],
      text: '',
    });
    const beforePaste = await blocks();

    await page.keyboard.press('ControlOrMeta+V');
    await expect
      .poll(async () => {
        const value = await blocks();

        return value.slice(16, 18);
      })
      .toMatchObject([
        { listType: 'numbered', text: 'Decimal 111' },
        { listType: 'numbered', text: 'Decimal 112' },
      ]);
    const afterPaste = await blocks();

    await testInfo.attach('pasted-list-state', {
      body: JSON.stringify(await editor.get.modelValue(), null, 2),
      contentType: 'application/json',
    });
    await page.screenshot({ path: testInfo.outputPath('list-clipboard.png') });
    expect
      .soft(
        afterPaste.slice(16, 18).map((block) => block.indent),
        'Copied sibling items must land at depth 1'
      )
      .toEqual([1, 1]);
    const first = root
      .locator('ol')
      .filter({ hasText: /^Decimal 111$/ })
      .last();
    const second = root
      .locator('ol')
      .filter({ hasText: /^Decimal 112$/ })
      .last();
    const target = root.locator('ol').filter({ hasText: /^Roman 3$/ });

    await expect.soft(first).toHaveAttribute('start', '4');
    await expect.soft(second).toHaveAttribute('start', '5');
    await expect.soft(first).toHaveCSS('list-style-type', 'upper-roman');
    await expect.soft(second).toHaveCSS('list-style-type', 'upper-roman');
    expect
      .soft(await first.getAttribute('data-list-id'))
      .toBe(await target.getAttribute('data-list-id'));
    expect
      .soft(await second.getAttribute('data-list-id'))
      .toBe(await target.getAttribute('data-list-id'));
    await expect
      .poll(async () => {
        const value = await blocks();

        return value.slice(8, 10);
      })
      .toEqual([
        { indent: 3, listType: 'numbered', text: 'Decimal 111' },
        { indent: 3, listType: 'numbered', text: 'Decimal 112' },
      ]);
    await editor.assert.collapsedModelDOMSelection({
      offset: 11,
      path: [17, 0],
      text: 'Decimal 112',
    });
    await page.keyboard.type('!');
    await editor.assert.collapsedModelDOMSelection({
      offset: 12,
      path: [17, 0],
      text: 'Decimal 112!',
    });
    await page.keyboard.press('ControlOrMeta+Z');
    await editor.assert.collapsedModelDOMSelection({
      offset: 11,
      path: [17, 0],
      text: 'Decimal 112',
    });
    await page.keyboard.press('ControlOrMeta+Z');
    await expect.poll(blocks).toEqual(beforePaste);
    await editor.assert.collapsedModelDOMSelection({
      offset: 0,
      path: [16, 0],
      text: '',
    });
    await page.keyboard.press('ControlOrMeta+Shift+Z');
    await expect.poll(blocks).toEqual(afterPaste);
    await editor.assert.collapsedModelDOMSelection({
      offset: 11,
      path: [17, 0],
      text: 'Decimal 112',
    });

    const trace = await takeBrowserNativeEventTrace(root);

    expect(trace.anomalies).toEqual([]);
    expect(trace.entries).toContainEqual(
      expect.objectContaining({
        inputType: 'insertFromPaste',
        isTrusted: true,
        type: 'beforeinput',
      })
    );
    runtimeErrors.assertNone();
  } finally {
    await testInfo.attach('list-clipboard-state', {
      body: JSON.stringify(
        {
          value: await editor.get.modelValue(),
          trace: await takeBrowserNativeEventTrace(root),
        },
        null,
        2
      ),
      contentType: 'application/json',
    });
    runtimeErrors.stop();
  }
});

for (const targetTag of ['p', 'h2']) {
  test(`list clipboard: image head replaces a nested empty ${targetTag} [EDIT-CLIPBOARD-LIST-LANDING-001]`, async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Native clipboard permissions');
    expect(testInfo.retry).toBe(0);

    const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
    const { editor, root } = await openListDemo(
      page,
      `list-image-${targetTag}`
    );
    const value = async () => {
      const { children, roots } =
        (await editor.get.modelValue()) as EditorDocumentValue;

      return { children, roots };
    };

    try {
      await root.getByText('Roman 1', { exact: true }).click();
      await page.keyboard.press('ControlOrMeta+A');
      await editor.clipboard.pasteHtml(
        '<ol><li><figure class="editor-image"><img src="/favicon-48x48.png" width="96" alt="Copied image"><figcaption>Head</figcaption></figure></li><li>Tail</li></ol>' +
          `<blockquote><${targetTag}></${targetTag}></blockquote><p>After</p>`,
        'Head\nTail\n\nAfter'
      );
      await expect.poll(value).toMatchObject({
        children: [
          { type: 'image', listType: 'numbered', children: [{ text: 'Head' }] },
          {
            type: 'paragraph',
            listType: 'numbered',
            children: [{ text: 'Tail' }],
          },
          {
            type: 'blockquote',
            children: [
              {
                type: targetTag === 'p' ? 'paragraph' : 'heading',
                children: [{ text: '' }],
              },
            ],
          },
          { type: 'paragraph', children: [{ text: 'After' }] },
        ],
      });
      const beforePaste = await value();

      await startBrowserNativeEventTrace(root);
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      await editor.focus();
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe('Head\nTail');
      await page.keyboard.press('ControlOrMeta+C');
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain('Tail');
      await editor.selection.selectDOM({
        anchor: { path: [2, 0, 0], offset: 0 },
        focus: { path: [2, 0, 0], offset: 0 },
      });
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 0, 0],
        offset: 0,
        text: '',
      });
      await page.keyboard.press('ControlOrMeta+V');
      await expect
        .poll(async () => {
          const { children } = await value();

          return children[2];
        })
        .toMatchObject({
          type: 'blockquote',
          children: [
            {
              type: 'image',
              listType: 'numbered',
              indent: 1,
              children: [{ text: 'Head' }],
            },
            {
              type: 'paragraph',
              listType: 'numbered',
              indent: 1,
              children: [{ text: 'Tail' }],
            },
          ],
        });
      const afterPaste = await value();
      expect(afterPaste.children.slice(0, 2)).toEqual(
        beforePaste.children.slice(0, 2)
      );
      expect(afterPaste.children).toHaveLength(4);
      expect(afterPaste.children[3]).toEqual(beforePaste.children[3]);
      const images = root.getByRole('img', {
        name: 'Copied image',
        exact: true,
      });
      await expect(images).toHaveCount(2);
      await expect(images.last()).toBeVisible();
      const pastedLists = root.locator('blockquote ol');
      await expect(pastedLists).toHaveCount(2);
      await expect(pastedLists.nth(0)).toHaveAttribute('start', '1');
      await expect(pastedLists.nth(1)).toHaveAttribute('start', '2');
      expect(
        await images
          .last()
          .evaluate((image) => (image as HTMLImageElement).naturalWidth)
      ).toBe(48);
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 1, 0],
        offset: 4,
        text: 'Tail',
      });
      await page.screenshot({
        path: testInfo.outputPath(`list-image-${targetTag}.png`),
      });
      await page.keyboard.type('!');
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 1, 0],
        offset: 5,
        text: 'Tail!',
      });
      await page.keyboard.press('ControlOrMeta+Z');
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 1, 0],
        offset: 4,
        text: 'Tail',
      });
      await page.keyboard.press('ControlOrMeta+Z');
      await expect.poll(value).toEqual(beforePaste);
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 0, 0],
        offset: 0,
        text: '',
      });
      await page.keyboard.press('ControlOrMeta+Shift+Z');
      await expect.poll(value).toEqual(afterPaste);
      await editor.assert.collapsedModelDOMSelection({
        path: [2, 1, 0],
        offset: 4,
        text: 'Tail',
      });
      const trace = await takeBrowserNativeEventTrace(root);
      expect(trace.anomalies).toEqual([]);
      expect(trace.entries).toContainEqual(
        expect.objectContaining({
          type: 'beforeinput',
          inputType: 'insertFromPaste',
          isTrusted: true,
        })
      );
      runtimeErrors.assertNone();
    } finally {
      await testInfo.attach('list-image-state', {
        body: JSON.stringify(
          {
            value: await value(),
            trace: await takeBrowserNativeEventTrace(root),
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
      runtimeErrors.stop();
    }
  });
}

// Playwright's mouse only extends a text selection, so this fires the DOM drag
// events a native drag would: from the start of the last "Decimal 11" to the
// end of "Decimal 111", with the copy modifier when `copy` is set.
const dropOnDecimal111End = (root: Locator, copy: boolean) =>
  root.evaluate((element, withCopy) => {
    const apple = /Mac|iPad|iPhone|iPod/.test(navigator.platform);
    const at = (text: string, nth: number, edge: 'end' | 'start') => {
      const target = [...element.querySelectorAll('[data-editor-string]')]
        .filter((candidate) => candidate.textContent === text)
        .at(nth)!;
      const rect = target.getBoundingClientRect();

      return {
        target,
        x: edge === 'start' ? rect.left + 2 : rect.right - 1,
        y: rect.top + rect.height / 2,
      };
    };
    const dataTransfer = new DataTransfer();
    const fire = (
      type: string,
      { target, x, y }: ReturnType<typeof at>,
      modified = false
    ) =>
      target.dispatchEvent(
        new DragEvent(type, {
          altKey: modified && apple,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          ctrlKey: modified && !apple,
          dataTransfer,
        })
      );
    const to = at('Decimal 111', 0, 'end');

    fire('dragstart', at('Decimal 11', -1, 'start'));
    fire('dragover', to, withCopy);
    fire('drop', to, withCopy);
    fire('dragend', to, withCopy);
  }, copy);

const renderedNumbers = (root: Locator) =>
  root.evaluate((element) =>
    [...element.querySelectorAll('ol')].map((list) => [
      list.textContent,
      list.start,
    ])
  );

const romanTwoFamily = {
  anchor: { offset: 0, path: [12, 0] },
  focus: { offset: 10, path: [14, 0] },
};

test('list drop: a copied text drop lands like a paste at the same caret [EDIT-CLIPBOARD-LIST-LANDING-001]', async ({
  browserName,
  page,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'Native clipboard permissions');
  expect(testInfo.retry).toBe(0);

  const decimal111End = { offset: 11, path: [8, 0] };
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const pasted = await openListDemo(page, 'list-drop:paste');

    await pasted.editor.selection.selectDOM(romanTwoFamily);
    await pasted.editor.focus();
    await page.keyboard.press('ControlOrMeta+C');
    await pasted.editor.selection.selectDOM({
      anchor: decimal111End,
      focus: decimal111End,
    });
    await page.keyboard.press('ControlOrMeta+V');
    await expect
      .poll(async () => {
        const value = await pasted.blocks();

        return value[8].text;
      })
      .toBe('Decimal 111Roman 2');
    const paste = await pasted.blocks();

    const dropped = await openListDemo(page, 'list-drop:drop');

    await dropped.editor.selection.selectDOM(romanTwoFamily);
    await dropped.editor.focus();
    await dropOnDecimal111End(dropped.root, true);
    await expect
      .poll(async () => {
        const value = await dropped.blocks();

        return value[8].text;
      })
      .toBe('Decimal 111Roman 2');

    expect(await dropped.blocks()).toEqual(paste);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list drop: a moved text drop lands its items at the depth a paste gives them [EDIT-CLIPBOARD-LIST-LANDING-001] [EDIT-LIST-DROP-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const moved = await openListDemo(page, 'list-drop:move');

    await moved.editor.selection.selectDOM(romanTwoFamily);
    await moved.editor.focus();
    await dropOnDecimal111End(moved.root, false);
    await expect
      .poll(async () => {
        const value = await moved.blocks();

        return value[8].text;
      })
      .toBe('Decimal 111Roman 2');

    const movedBlocks = await moved.blocks();

    expect({
      blocks: movedBlocks.slice(6).map(({ indent, text }) => [text, indent]),
      numbers: await renderedNumbers(moved.root),
    }).toEqual({
      blocks: [
        ['Roman 1', 1],
        ['Decimal 11', 2],
        ['Decimal 111Roman 2', 3],
        ['Decimal 11', 4],
        ['Decimal 12', 4],
        ['Decimal 112', 3],
        ['Decimal 12', 2],
        ['Decimal 13', 2],
        ['Roman 3', 1],
        ['Roman 4', 1],
      ],
      numbers: [
        ['Roman 1', 1],
        ['Decimal 11', 1],
        ['Decimal 111Roman 2', 1],
        ['Decimal 11', 1],
        ['Decimal 12', 2],
        ['Decimal 112', 2],
        ['Decimal 12', 2],
        ['Decimal 13', 3],
        ['Roman 3', 2],
        ['Roman 4', 3],
      ],
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

const dragHandle = async (
  page: Page,
  root: Locator,
  { copy, from, to }: { copy: boolean; from: Locator; to: string }
) => {
  const handle = from
    .locator('xpath=..')
    .getByRole('button', { name: 'Drag block' });

  await from.hover();
  await handle.hover();

  const handleBox = await handle.boundingBox();
  const targetBox = await root
    .locator('.editor-blockWrapper')
    .filter({ hasText: new RegExp(`^${to}$`) })
    .boundingBox();
  const modifier = await page.evaluate(() =>
    /Mac|iPad|iPhone|iPod/.test(navigator.platform) ? 'Alt' : 'Control'
  );

  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2
  );
  if (copy) await page.keyboard.down(modifier);
  try {
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + 3,
      {
        steps: 12,
      }
    );
    await page.mouse.up();
  } finally {
    if (copy) await page.keyboard.up(modifier);
  }
};

const copyRomanThreeToTop = async (
  page: Page,
  demo: Awaited<ReturnType<typeof openListDemo>>
) => {
  await dragHandle(page, demo.root, {
    copy: true,
    from: demo.root
      .locator('.editor-blockWrapper')
      .filter({ hasText: /^Roman 3$/ }),
    to: 'Todo 1',
  });
  await expect
    .poll(async () => {
      const blocks = await demo.blocks();

      return blocks.length;
    })
    .toBe(18);
};

test('list drop: a handle copy dropped away from its list numbers as a list of its own [EDIT-LIST-DROP-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const copied = await openListDemo(page, 'list-drop:handle-copy');

    await copyRomanThreeToTop(page, copied);

    const copiedBlocks = await copied.blocks();

    expect({
      blocks: copiedBlocks.slice(2, 4).map(({ text }) => text),
      numbers: await renderedNumbers(copied.root),
    }).toEqual({
      blocks: ['Roman 3', 'Todo 1'],
      numbers: [
        ['Roman 3', 1],
        ['Roman 1', 1],
        ['Decimal 11', 1],
        ['Decimal 111', 1],
        ['Decimal 112', 2],
        ['Decimal 12', 2],
        ['Decimal 13', 3],
        ['Roman 2', 2],
        ['Decimal 11', 1],
        ['Decimal 12', 2],
        ['Roman 3', 3],
        ['Roman 4', 4],
      ],
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list drop: a handle move into another list joins it [EDIT-LIST-DROP-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const moved = await openListDemo(page, 'list-drop:handle-move');

    await copyRomanThreeToTop(page, moved);
    await dragHandle(page, moved.root, {
      copy: false,
      from: moved.root
        .locator('.editor-blockWrapper')
        .filter({ hasText: /^Roman 3$/ })
        .first(),
      to: 'Roman 2',
    });
    await expect
      .poll(async () => {
        const blocks = await moved.blocks();

        return blocks[2].text;
      })
      .toBe('Todo 1');

    const movedBlocks = await moved.blocks();
    const texts = movedBlocks.map(({ text }) => text);
    const landed = texts.indexOf('Roman 2');

    expect({
      blocks: texts.slice(landed - 2, landed + 1),
      numbers: await renderedNumbers(moved.root),
    }).toEqual({
      blocks: ['Decimal 13', 'Roman 3', 'Roman 2'],
      numbers: [
        ['Roman 1', 1],
        ['Decimal 11', 1],
        ['Decimal 111', 1],
        ['Decimal 112', 2],
        ['Decimal 12', 2],
        ['Decimal 13', 3],
        ['Roman 3', 2],
        ['Roman 2', 3],
        ['Decimal 11', 1],
        ['Decimal 12', 2],
        ['Roman 3', 4],
        ['Roman 4', 5],
      ],
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list keys: a keyboard move into another list joins it [EDIT-LIST-DROP-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    const stepped = await openListDemo(page, 'list-keys:step-move');

    await copyRomanThreeToTop(page, stepped);
    await stepped.root.getByText('Roman 3', { exact: true }).first().click();
    await page.keyboard.press('ControlOrMeta+Shift+ArrowDown');
    await page.keyboard.press('ControlOrMeta+Shift+ArrowDown');
    await expect
      .poll(async () => {
        const blocks = await stepped.blocks();

        return blocks.slice(2, 7).map(({ text }) => text);
      })
      .toEqual(['Todo 1', 'Disc 1', 'Disc 2', 'Todo 2', 'Roman 3']);

    expect(await renderedNumbers(stepped.root)).toEqual([
      ['Roman 3', 1],
      ['Roman 1', 2],
      ['Decimal 11', 1],
      ['Decimal 111', 1],
      ['Decimal 112', 2],
      ['Decimal 12', 2],
      ['Decimal 13', 3],
      ['Roman 2', 3],
      ['Decimal 11', 1],
      ['Decimal 12', 2],
      ['Roman 3', 4],
      ['Roman 4', 5],
    ]);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
