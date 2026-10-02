import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const CASE_ID = 'dnd:drag-handle-excluded-from-native-selection';
const PREVIEW_CASE_ID = 'dnd:block-preview-origin';
const COPY_CASE_ID = 'dnd:same-editor-modifier-copy';

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const harness = createBrowserEditorHarness(
      page,
      CASE_ID,
      page.locator('.editor-editor')
    );
    await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });

    const heading = page.getByRole('heading', {
      name: 'Collaborative Editing',
    });
    const draggable = page.locator('.editor-editor > div').filter({
      has: heading,
    });
    const previousText = draggable
      .locator('xpath=preceding-sibling::*[1]')
      .locator('[data-editor-node="text"]')
      .last();
    const handle = draggable.getByRole('button', { name: 'Drag block' });

    await heading.scrollIntoViewIfNeeded();

    const start = await previousText.boundingBox();
    const end = await heading.boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();

    await page.mouse.move(
      start!.x + start!.width / 2,
      start!.y + start!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(end!.x + 220, end!.y + end!.height / 2, {
      steps: 8,
    });
    await page.mouse.up();

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toContain('Collaborative Editing');
    expect(
      await page.evaluate(() => window.getSelection()?.toString())
    ).not.toContain('⠿');
    // WebKit exposes only the prefixed computed property.
    expect(
      await handle.evaluate((element) => {
        const style = getComputedStyle(element) as CSSStyleDeclaration & {
          webkitUserSelect?: string;
        };

        return style.userSelect ?? style.webkitUserSelect;
      })
    ).toBe('none');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(PREVIEW_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  await page.addInitScript(() => {
    const nativeSetDragImage = DataTransfer.prototype.setDragImage;

    DataTransfer.prototype.setDragImage = function setDragImage(image, x, y) {
      const rect = image.getBoundingClientRect();

      Reflect.set(window, '__plateDragImageProbe', {
        childCount: image.childElementCount,
        height: rect.height,
        text: image.textContent,
        top: rect.top,
        width: rect.width,
        x,
        y,
      });

      return nativeSetDragImage.call(this, image, x, y);
    };
  });

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page.locator('.editor-editor');
    const harness = createBrowserEditorHarness(page, PREVIEW_CASE_ID, editor);
    const text =
      'Plate offers many features out-of-the-box as free, open-source plugins.';

    await harness.ready({ editor: 'visible', text });

    const block = editor.locator('.editor-blockWrapper').filter({
      hasText: text,
    });

    await block.scrollIntoViewIfNeeded();
    await block.hover();

    const handle = block
      .locator('xpath=..')
      .getByRole('button', { name: 'Drag block' });

    await handle.hover();

    const handleBox = await handle.boundingBox();
    const blockBox = await block.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(blockBox).not.toBeNull();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 80, handleBox!.y + 20, { steps: 8 });

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Reflect.get(window, '__plateDragImageProbe') as
              | {
                  childCount: number;
                  height: number;
                  text: string | null;
                  top: number;
                  width: number;
                  x: number;
                  y: number;
                }
              | undefined
        )
      )
      .toMatchObject({
        childCount: 1,
        text: expect.stringContaining(text),
      });
    const preview = await page.evaluate(
      () =>
        Reflect.get(window, '__plateDragImageProbe') as {
          childCount: number;
          height: number;
          text: string | null;
          top: number;
          width: number;
          x: number;
          y: number;
        }
    );

    expect(preview.height).toBeGreaterThan(0);
    expect(preview.width).toBeGreaterThan(0);
    expect(Math.abs(preview.top - blockBox!.y)).toBeLessThan(16);

    await page.mouse.up();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(COPY_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page.locator('.editor-editor');
    const harness = createBrowserEditorHarness(page, COPY_CASE_ID, editor);
    const text =
      'Plate offers many features out-of-the-box as free, open-source plugins.';

    await harness.ready({ editor: 'visible', text });

    const blocks = editor.locator('.editor-blockWrapper');
    const countCopies = () =>
      blocks.evaluateAll(
        (elements, blockText) =>
          elements.filter((element) => element.textContent === blockText)
            .length,
        text
      );
    const index = await blocks.evaluateAll(
      (elements, blockText) =>
        elements.findIndex((element) => element.textContent === blockText),
      text
    );
    const block = blocks.nth(index);
    // The heading above: a root-level edge where a move would be a no-op.
    const target = blocks.nth(index - 1);

    await block.scrollIntoViewIfNeeded();
    await block.hover();

    const handle = block
      .locator('xpath=..')
      .getByRole('button', { name: 'Drag block' });

    await handle.hover();

    const handleBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    const modifier = await page.evaluate(() =>
      /Mac|iPad|iPhone|iPod/.test(navigator.platform) ? 'Alt' : 'Control'
    );

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2
    );
    await page.keyboard.down(modifier);
    try {
      await page.mouse.down();
      await page.mouse.move(
        targetBox!.x + targetBox!.width / 2,
        targetBox!.y + targetBox!.height * 0.75,
        { steps: 12 }
      );
      await page.mouse.up();
    } finally {
      await page.keyboard.up(modifier);
    }

    await expect.poll(countCopies).toBe(2);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

const MOVE_CASE_ID = 'dnd:block-move-actions';

const textIndex = async (
  page: import('@playwright/test').Page,
  texts: readonly string[]
) =>
  page.locator('.editor-editor').evaluate((root, needles) => {
    const content = root.textContent ?? '';

    return needles.map((needle) => content.indexOf(needle));
  }, texts);

test.describe(MOVE_CASE_ID, () => {
  const text =
    'Plate offers many features out-of-the-box as free, open-source plugins.';
  const heading = 'How Plate Compares';

  test.beforeEach(async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    await createBrowserEditorHarness(
      page,
      MOVE_CASE_ID,
      page.locator('.editor-editor')
    ).ready({ editor: 'visible', text });
  });

  test('moves the block around the caret with the shortcut and keeps the caret', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.getByText(text).click();
      await page.keyboard.press('End');
      await page.keyboard.press('ControlOrMeta+Shift+ArrowUp');

      await expect
        .poll(async () => {
          const [moved, above] = await textIndex(page, [text, heading]);

          return moved < above;
        })
        .toBe(true);

      await page.keyboard.type('!');
      await expect(page.locator('.editor-editor')).toContainText(`${text}!`);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves a block up through its handle actions', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const block = page
        .locator('.editor-editor .editor-blockWrapper')
        .filter({ hasText: text })
        .first();

      await block.scrollIntoViewIfNeeded();
      await block.hover();
      await block
        .locator('xpath=..')
        .getByRole('button', { name: 'Drag block' })
        .click();
      await page.getByRole('menuitem', { name: 'Move up' }).click();

      await expect
        .poll(async () => {
          const [moved, above] = await textIndex(page, [text, heading]);

          return moved < above;
        })
        .toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves a column right through its handle actions', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const first = 'First column content.';
    const second = 'Second column content.';

    try {
      const column = page.getByText(first);

      await column.scrollIntoViewIfNeeded();
      await column.hover();
      await page
        .getByRole('button', { name: 'Drag column or open column actions' })
        .first()
        .click();
      await page.getByRole('menuitem', { name: 'Move right' }).click();

      await expect
        .poll(async () => {
          const [moved, beside] = await textIndex(page, [first, second]);

          return moved > beside;
        })
        .toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('drags a column right by its handle', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const first = 'First column content.';
    const second = 'Second column content.';

    try {
      const column = page.getByText(first);
      const target = page
        .getByText(second)
        .locator(
          'xpath=ancestor::*[.//button[@aria-label="Drag column or open column actions"]][1]'
        );

      await column.scrollIntoViewIfNeeded();
      await column.hover();

      const handle = await page
        .getByRole('button', { name: 'Drag column or open column actions' })
        .first()
        .boundingBox();
      const box = await target.boundingBox();

      expect(handle).not.toBeNull();
      expect(box).not.toBeNull();

      const x = box!.x + box!.width * 0.85;
      const y = box!.y + box!.height / 2;

      await page.mouse.move(
        handle!.x + handle!.width / 2,
        handle!.y + handle!.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(x, y, { steps: 12 });
      // Emulated drags drop back-to-back dragovers; paced moves let one land.
      for (const offset of [1, 0, 1]) {
        await page.waitForTimeout(50);
        await page.mouse.move(x, y + offset);
      }
      await page.mouse.up();

      await expect
        .poll(async () => {
          const [moved, beside] = await textIndex(page, [first, second]);

          return moved > beside;
        })
        .toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('moves a table row down through its handle actions', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const row = page.locator('.editor-editor tr').filter({
        has: page.locator('td', { hasText: /^Comments$/ }),
      });
      const rowText = (await row.textContent()) ?? '';
      const nextRowText =
        (await row.locator('xpath=following-sibling::tr[1]').textContent()) ??
        '';

      await row.scrollIntoViewIfNeeded();
      await row.hover();
      await row
        .getByRole('button', { name: 'Drag row or open row actions' })
        .click();
      await page.getByRole('menuitem', { name: 'Move down' }).click();

      await expect
        .poll(async () => {
          const [moved, below] = await textIndex(page, [rowText, nextRowText]);

          return moved > below;
        })
        .toBe(true);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});

const LANDING_CASE_ID = 'dnd:schema-derived-landing';

type ModelNode = {
  children?: ModelNode[];
  listType?: string;
  text?: string;
  type?: string;
};

const modelText = (node: ModelNode): string =>
  node.text ?? (node.children ?? []).map(modelText).join('');

const deepestBlockStartingWith = (
  children: readonly ModelNode[],
  prefix: string,
  path: readonly number[] = [],
  holders: readonly string[] = []
): { holders: string[]; path: number[]; previous?: string } | null => {
  for (const [index, node] of children.entries()) {
    if (!node.children) continue;

    const found = deepestBlockStartingWith(
      node.children,
      prefix,
      [...path, index],
      [...holders, node.type ?? '']
    );

    if (found) return found;
    if (modelText(node).startsWith(prefix)) {
      return {
        holders: [...holders],
        path: [...path, index],
        previous: children[index - 1]?.type,
      };
    }
  }

  return null;
};

test.describe(LANDING_CASE_ID, () => {
  const payload = 'Plate offers many features';

  test.use({ viewport: { height: 2400, width: 1280 } });

  test.beforeEach(async ({ page }, testInfo) => {
    expect(testInfo.retry).toBe(0);
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    await createBrowserEditorHarness(
      page,
      LANDING_CASE_ID,
      page.locator('.editor-editor')
    ).ready({ editor: 'visible', text: payload });
  });

  const children = async (page: Page) =>
    (
      (await createBrowserEditorHarness(
        page,
        LANDING_CASE_ID,
        page.locator('.editor-editor')
      ).get.modelValue()) as { children: ModelNode[] }
    ).children;

  const locate = async (page: Page, prefix: string) =>
    deepestBlockStartingWith(await children(page), prefix);

  const box = async (locator: Locator) => {
    const result = await locator.boundingBox();

    expect(result).not.toBeNull();

    return result!;
  };

  const rootBlock = (page: Page, has: Locator) =>
    page.locator('.editor-editor .editor-blockWrapper').filter({ has }).first();

  const paragraph = (page: Page, text: string) =>
    rootBlock(page, page.getByText(text));

  const heading = (page: Page, name: string) =>
    rootBlock(page, page.getByRole('heading', { exact: true, name }));

  const dragBlock = async (
    page: Page,
    block: Locator,
    to: () => Promise<{ x: number; y: number }>,
    { at, copy = false }: { at?: { x: number; y: number }; copy?: boolean } = {}
  ) => {
    // The tall viewport holds the payload and its target once it is centered.
    await block.evaluate((element) =>
      element.scrollIntoView({ block: 'center' })
    );
    await block.hover({ position: at });

    // The nearest wrapper's own handle precedes its nested blocks' handles.
    const handle = block
      .locator(
        'xpath=ancestor-or-self::div[contains(concat(" ", normalize-space(@class), " "), " editor-draggable ")][1]'
      )
      .getByRole('button', { name: 'Drag block' })
      .first();

    await handle.hover();

    // `box` and `to()` only read rects, which never scroll, so `from` stays
    // where the pointer goes down.
    const from = await box(handle);
    const { x, y } = await to();

    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(page.viewportSize()!.height);
    const modifier = await page.evaluate(() =>
      /Mac|iPad|iPhone|iPod/.test(navigator.platform) ? 'Alt' : 'Control'
    );

    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    if (copy) await page.keyboard.down(modifier);
    try {
      await page.mouse.down();
      await page.mouse.move(x, y, { steps: 12 });
      // Emulated drags drop back-to-back dragovers; paced moves let one land.
      for (const offset of [1, 0, 1]) {
        await page.waitForTimeout(50);
        await page.mouse.move(x, y + offset);
      }
      await page.mouse.up();
    } finally {
      if (copy) await page.keyboard.up(modifier);
    }
  };

  const quote = (page: Page) =>
    page.locator('.editor-editor blockquote').first();

  const tableBlock = (page: Page) => rootBlock(page, page.locator('table'));

  const landing = (name: string, run: (page: Page) => Promise<void>) =>
    test(name, async ({ page }) => {
      const runtimeErrors = recordBrowserRuntimeErrors(page);

      try {
        await run(page);
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

  landing('drops a block inside a blockquote', async (page) => {
    await dragBlock(page, paragraph(page, payload), async () => {
      const first = await box(
        quote(page).locator('[data-editor-node="element"]').first()
      );

      return { x: first.x + first.width / 2, y: first.y + first.height * 0.75 };
    });

    await expect
      .poll(() => locate(page, payload))
      .toMatchObject({ holders: ['blockquote'], path: [10, 1] });
  });

  landing('drops a block inside a table cell', async (page) => {
    await dragBlock(page, paragraph(page, payload), async () => {
      const cell = await box(
        page.locator('.editor-editor tr').nth(1).locator('td').nth(1)
      );

      return { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 };
    });

    await expect
      .poll(async () => {
        const found = await locate(page, payload);

        return found?.holders;
      })
      .toEqual(['table', 'tableRow', 'tableCell']);
  });

  landing('drops a block inside a column', async (page) => {
    const name = 'Multi-column Layout';

    await dragBlock(page, heading(page, name), async () => {
      const text = await box(page.getByText('First column content.'));

      return { x: text.x + text.width / 2, y: text.y + text.height * 0.75 };
    });

    await expect
      .poll(async () => {
        const found = await locate(page, name);

        return found?.holders;
      })
      .toEqual(['columnGroup', 'column']);
  });

  landing('drops below a blockquote from its bottom edge', async (page) => {
    await dragBlock(page, paragraph(page, payload), async () => {
      const outer = await box(quote(page));

      return { x: outer.x + outer.width / 2, y: outer.y + outer.height - 1 };
    });

    await expect
      .poll(() => locate(page, payload))
      .toMatchObject({ holders: [], path: [11], previous: 'blockquote' });
  });

  landing('drops after a table from below its last row', async (page) => {
    await dragBlock(page, paragraph(page, payload), async () => {
      const table = await box(tableBlock(page));

      return { x: table.x + table.width / 2, y: table.y + table.height - 2 };
    });

    await expect
      .poll(() => locate(page, payload))
      .toMatchObject({ holders: [], previous: 'table' });
  });

  landing('drops after a trailing table inside a blockquote', async (page) => {
    // 6px up is the inner half of the quotes' shared bottom band, the nested
    // quote's.
    await dragBlock(page, tableBlock(page), async () => {
      const outer = await box(quote(page));

      return { x: outer.x + outer.width / 2, y: outer.y + outer.height - 6 };
    });
    await expect
      .poll(async () => {
        const blocks = await children(page);

        return blocks[10]?.children?.at(-1)?.type;
      })
      .toBe('table');

    await dragBlock(page, paragraph(page, payload), async () => {
      const table = await box(
        quote(page)
          .locator('[data-editor-node="element"]')
          .filter({ has: page.locator('table') })
          .first()
      );

      // The table and the quote share their bottom edge; its inner half is
      // the table's.
      return { x: table.x + table.width / 2, y: table.y + table.height - 6 };
    });

    await expect
      .poll(() => locate(page, payload))
      .toMatchObject({ holders: ['blockquote'], previous: 'table' });
  });

  landing('drops before a heading from its top margin', async (page) => {
    const name = 'How Plate Compares';

    await dragBlock(page, paragraph(page, payload), async () => {
      const above = await box(paragraph(page, 'Create links'));
      const target = await box(
        page.getByRole('heading', { exact: true, name })
      );

      expect(target.y - (above.y + above.height)).toBeGreaterThan(2);

      return {
        x: target.x + target.width / 2,
        y: (above.y + above.height + target.y) / 2,
      };
    });

    await expect
      .poll(async () => {
        const found = await locate(page, name);

        return found?.path;
      })
      .toEqual([14]);
    await expect
      .poll(async () => {
        const found = await locate(page, payload);

        return found?.path;
      })
      .toEqual([13]);
  });

  landing(
    'drops before a list item from the gutter beside it',
    async (page) => {
      const item = 'Generate content';
      const moved = 'Review and refine content';
      const line = page
        .locator('.editor-editor [data-editor-node="text"]')
        .filter({ hasText: item })
        .first();

      const blocks = await children(page);

      expect(blocks[6]?.listType).toBe('bulleted');

      await dragBlock(page, paragraph(page, moved), async () => {
        const root = await box(page.locator('.editor-editor'));
        const target = await box(line);

        return { x: root.x + 4, y: target.y + target.height * 0.25 };
      });

      await expect
        .poll(async () => {
          const found = await locate(page, moved);

          return found?.path;
        })
        .toEqual([5]);
      await expect
        .poll(async () => {
          const found = await locate(page, item);

          return found?.path;
        })
        .toEqual([6]);
    }
  );

  landing(
    'drops below the last block from the bottom padding',
    async (page) => {
      const name = 'Multi-column Layout';
      const blocks = await children(page);
      const lastIndex = blocks.length - 1;

      await dragBlock(page, heading(page, name), async () => {
        const final = await box(
          page.locator('.editor-editor .editor-blockWrapper').last()
        );
        const root = await box(page.locator('.editor-editor'));
        const bottom = root.y + root.height;

        expect(bottom - (final.y + final.height)).toBeGreaterThan(8);

        return {
          x: root.x + root.width / 2,
          y: (final.y + final.height + bottom) / 2,
        };
      });

      await expect
        .poll(async () => {
          const found = await locate(page, name);

          return found?.path;
        })
        .toEqual([lastIndex]);
    }
  );

  landing('drops below a closed details from its summary', async (page) => {
    const name = 'Callouts and Details';

    await expect(
      page.getByRole('button', { name: 'Expand details' }).first()
    ).toBeVisible();

    await dragBlock(page, heading(page, name), async () => {
      const summary = await box(page.getByText('Expand to explore').first());

      return {
        x: summary.x + summary.width / 2,
        y: summary.y + summary.height * 0.75,
      };
    });

    await expect
      .poll(() => locate(page, name))
      .toMatchObject({ holders: [], previous: 'details' });
  });

  landing(
    'shows one handle for a hovered block inside a blockquote',
    async (page) => {
      const inner = quote(page).locator('[data-editor-node="element"]').first();

      await inner.scrollIntoViewIfNeeded();
      await inner.hover();

      await expect
        .poll(() =>
          page
            .locator('.editor-editor .editor-gutterLeft')
            .evaluateAll(
              (gutters) =>
                gutters.filter(
                  (gutter) => getComputedStyle(gutter).opacity === '1'
                ).length
            )
        )
        .toBe(1);
    }
  );

  landing("drags a quote's last child out below the quote", async (page) => {
    const nested = quote(page).locator('blockquote').first();

    // The nested quote's own padding, beside its paragraph, shows the nested
    // quote's handle.
    await dragBlock(
      page,
      nested,
      async () => {
        const outer = await box(quote(page));

        return { x: outer.x + outer.width / 2, y: outer.y + outer.height - 1 };
      },
      { at: { x: 4, y: 4 } }
    );

    await expect
      .poll(() => locate(page, 'Nested blockquotes work here too.'))
      .toMatchObject({ holders: ['blockquote'], path: [11, 0] });
  });

  landing('copies a block onto itself with the copy modifier', async (page) => {
    await dragBlock(
      page,
      paragraph(page, payload),
      async () => {
        const self = await box(paragraph(page, payload));

        return { x: self.x + self.width / 2, y: self.y + self.height * 0.75 };
      },
      { copy: true }
    );

    await expect
      .poll(async () => {
        const blocks = await children(page);

        return blocks.filter((node) => modelText(node).startsWith(payload))
          .length;
      })
      .toBe(2);
  });
});
