import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Locator, Page } from '@playwright/test';

const CASE_ID = 'media-caption:file-selection-to-toc-navigation';
const EDITOR = '[data-editor="true"][contenteditable="true"]';
const ARABIC = 'مرحبا بالعالم';
const RTL_PARAGRAPH_SETUP = {
  editorDirection: 'ltr',
  paragraphDirection: 'rtl',
  paragraphType: 'paragraph',
};
const HIDDEN_CAPTIONS = {
  'content-visibility': {
    css: 'figure figcaption { content-visibility: hidden !important; }',
    style: { contentVisibility: 'hidden' },
  },
  display: {
    css: 'figure figcaption { display: none !important; }',
    style: { display: 'none' },
  },
  visibility: {
    css: 'figure figcaption { visibility: hidden !important; }',
    style: { visibility: 'hidden' },
  },
} as const;

type MediaValue = {
  children: Array<{
    children?: Array<{ text?: string }>;
    type?: string;
  }>;
};

const openMediaEditor = async (
  page: Page,
  route: '/blocks/editor-ai' | '/blocks/media-demo',
  name: string
) => {
  await page.goto(route, { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(
    page,
    `media-caption:${name}`,
    root
  );

  await editor.ready({
    editor: 'visible',
    text:
      route === '/blocks/media-demo'
        ? 'Image caption'
        : 'Images with captions provide context.',
  });

  const value = (await editor.get.modelValue()) as MediaValue;
  const blockText = async (index: number) =>
    ((await editor.get.modelValue()) as MediaValue).children[index]?.children
      ?.map((child) => child.text ?? '')
      .join('');
  const blockStyle = (index: number, selector = '') =>
    root.evaluate(
      (element, [path, inner]) => {
        const block = element.querySelector(`[data-editor-path="${path}"]`);
        const target = inner ? block?.querySelector(inner) : block;

        if (!target) return null;

        const { contentVisibility, direction, display, visibility } =
          getComputedStyle(target);

        return { contentVisibility, direction, display, visibility };
      },
      [index, selector] as const
    );
  const caretInCaption = (index: number) =>
    root.evaluate((element, path) => {
      const selection = element.ownerDocument.getSelection();
      const caption = element.querySelector(
        `[data-editor-path="${path}"] figcaption`
      );

      return !!(
        selection?.rangeCount &&
        selection.anchorNode &&
        caption?.contains(selection.anchorNode)
      );
    }, index);
  const modelSelection = () =>
    root.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );
  const nativeRangeCount = () =>
    root.evaluate(
      (element) => element.ownerDocument.getSelection()?.rangeCount ?? 0
    );

  return {
    blockStyle,
    blockText,
    caretInCaption,
    editor,
    modelSelection,
    nativeRangeCount,
    root,
    value,
  };
};

const openArabicParagraphBeforeImage = async (page: Page, name: string) => {
  const media = await openMediaEditor(page, '/blocks/media-demo', name);
  const { blockStyle, blockText, editor, root, value } = media;
  const imageIndex = value.children.findIndex((node) => node.type === 'image');
  const paragraphIndex = imageIndex - 1;
  const paragraph = value.children[paragraphIndex].children!;

  await editor.selection.selectDOM({
    anchor: { offset: 0, path: [paragraphIndex, 0] },
    focus: {
      offset: paragraph.at(-1)!.text!.length,
      path: [paragraphIndex, paragraph.length - 1],
    },
  });
  await page.keyboard.insertText(ARABIC);
  await expect.poll(() => blockText(paragraphIndex)).toBe(ARABIC);
  await root.evaluate((element, path) => {
    element
      .querySelector(`[data-editor-path="${path}"]`)
      ?.setAttribute('dir', 'auto');
  }, paragraphIndex);

  const paragraphStyle = await blockStyle(paragraphIndex);
  const setup = {
    editorDirection: await root.evaluate(
      (element) => getComputedStyle(element).direction
    ),
    paragraphDirection: paragraphStyle?.direction,
    paragraphType: value.children[paragraphIndex].type,
  };

  return { ...media, imageIndex, paragraphIndex, setup };
};
const nativeCaretTop = (root: Locator) =>
  root.evaluate((element) => {
    const selection = element.ownerDocument.getSelection();

    return selection?.rangeCount &&
      selection.anchorNode &&
      element.contains(selection.anchorNode)
      ? selection.getRangeAt(0).getBoundingClientRect().top
      : null;
  });

test('Enter from an aligned image caption creates a clean paragraph', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });

    const root = page.locator(EDITOR).first();
    const editor = createBrowserEditorHarness(
      page,
      'media-caption:aligned-image-enter',
      root
    );

    await editor.ready({
      editor: 'visible',
      text: 'Images with captions provide context.',
    });

    const initial = (await editor.get.modelValue()) as {
      children: Array<{
        children?: Array<{ text?: string }>;
        textAlign?: string;
        type?: string;
        url?: string;
        width?: number | string;
      }>;
    };
    const imageIndex = initial.children.findIndex(
      (node) =>
        node.type === 'image' &&
        node.children?.[0]?.text === 'Images with captions provide context.'
    );

    expect(imageIndex).toBeGreaterThanOrEqual(0);
    expect(initial.children[imageIndex]).toMatchObject({
      textAlign: 'center',
      type: 'image',
      width: '75%',
    });

    await editor.selection.selectDOM({
      anchor: { offset: 6, path: [imageIndex, 0] },
      focus: { offset: 6, path: [imageIndex, 0] },
    });
    await editor.press('Enter');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;
        const left = value.children[imageIndex];
        const right = value.children[imageIndex + 1];

        return {
          left: {
            text: left?.children?.[0]?.text,
            textAlign: left?.textAlign,
            type: left?.type,
            width: left?.width,
          },
          right: {
            text: right?.children?.[0]?.text,
            textAlign: right?.textAlign ?? null,
            type: right?.type,
            url: right?.url ?? null,
            width: right?.width ?? null,
          },
        };
      })
      .toEqual({
        left: {
          text: 'Images',
          textAlign: 'center',
          type: 'image',
          width: '75%',
        },
        right: {
          text: ' with captions provide context.',
          textAlign: null,
          type: 'paragraph',
          url: null,
          width: null,
        },
      });
    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { offset: 0, path: [imageIndex + 1, 0] },
        focus: { offset: 0, path: [imageIndex + 1, 0] },
      });

    const paragraphText = root.getByText('with captions provide context.', {
      exact: true,
    });

    await expect(paragraphText).toBeVisible();
    await expect
      .poll(() =>
        paragraphText.evaluate((element) => getComputedStyle(element).textAlign)
      )
      .not.toBe('center');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('image chrome selects the owner; caption edits and owner deletion remain distinct', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
    const root = page.locator(EDITOR).first();
    const editor = createBrowserEditorHarness(
      page,
      'media-caption:owner-versus-caption',
      root
    );

    await editor.ready({
      editor: 'visible',
      text: 'Images with captions provide context.',
    });

    const initial = (await editor.get.modelValue()) as {
      children: Array<{
        children?: Array<{ text?: string }>;
        type?: string;
      }>;
    };
    const imageIndex = initial.children.findIndex(
      (node) =>
        node.type === 'image' &&
        node.children?.[0]?.text === 'Images with captions provide context.'
    );

    expect(imageIndex).toBeGreaterThanOrEqual(0);

    const figure = root
      .locator('figure')
      .filter({ has: page.locator('img') })
      .first();
    const modelSelection = () =>
      root.evaluate(
        (element, key) =>
          (
            element as HTMLElement &
              Record<string, { getModelSelection: () => unknown } | undefined>
          )[key]?.getModelSelection(),
        BROWSER_HANDLE_KEY
      );

    await figure.locator('img').click();
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    await expect
      .poll(() => root.evaluate(() => getSelection()?.rangeCount))
      .toBe(0);

    await editor.press('Delete');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children.some(
          (node) =>
            node.type === 'image' &&
            node.children?.[0]?.text === 'Images with captions provide context.'
        );
      })
      .toBe(false);

    await editor.press('ControlOrMeta+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children[imageIndex]?.children?.[0]?.text;
      })
      .toBe('Images with captions provide context.');

    await editor.selection.select({
      anchor: { offset: 6, path: [imageIndex, 0] },
      focus: { offset: 6, path: [imageIndex, 0] },
    });
    await page.keyboard.type('!');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return {
          caption: value.children[imageIndex]?.children?.[0]?.text,
          type: value.children[imageIndex]?.type,
        };
      })
      .toEqual({
        caption: 'Images! with captions provide context.',
        type: 'image',
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('arrow keys traverse the image owner before its caption', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
    const root = page.locator(EDITOR).first();
    const editor = createBrowserEditorHarness(
      page,
      'media-caption:keyboard-owner-traversal',
      root
    );

    await editor.ready({
      editor: 'visible',
      text: 'Images with captions provide context.',
    });

    const value = (await editor.get.modelValue()) as {
      children: Array<{
        children?: Array<{ text?: string }>;
        type?: string;
      }>;
    };
    const imageIndex = value.children.findIndex(
      (node) =>
        node.type === 'image' &&
        node.children?.[0]?.text === 'Images with captions provide context.'
    );

    expect(imageIndex).toBeGreaterThan(0);
    const before = value.children[imageIndex - 1].children!;
    const lastTextIndex = before.length - 1;
    const beforeEnd = {
      offset: before[lastTextIndex].text!.length,
      path: [imageIndex - 1, lastTextIndex],
    };
    const captionStart = { offset: 0, path: [imageIndex, 0] };
    const modelSelection = () =>
      root.evaluate(
        (element, key) =>
          (
            element as HTMLElement &
              Record<string, { getModelSelection: () => unknown } | undefined>
          )[key]?.getModelSelection(),
        BROWSER_HANDLE_KEY
      );

    const beforeFirstLine = {
      offset: 0,
      path: [imageIndex - 1, 0],
    };

    await editor.selection.selectDOM({
      anchor: beforeFirstLine,
      focus: beforeFirstLine,
    });
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(async () => {
        const selection = (await modelSelection()) as {
          anchor: { path: number[] };
          kind: string;
        };

        return { block: selection.anchor.path[0], kind: selection.kind };
      })
      .toEqual({ block: imageIndex - 1, kind: 'text' });

    const beforeLastLine = {
      ...beforeEnd,
      offset: Math.max(0, beforeEnd.offset - 3),
    };

    await editor.selection.selectDOM({
      anchor: beforeLastLine,
      focus: beforeLastLine,
    });
    await page.keyboard.press('ArrowDown');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });

    await editor.selection.selectDOM({ anchor: beforeEnd, focus: beforeEnd });
    await page.keyboard.press('ArrowDown');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    await page.keyboard.press('ArrowUp');
    await expect.poll(modelSelection).toMatchObject({
      anchor: beforeEnd,
      focus: beforeEnd,
      kind: 'text',
    });

    await page.keyboard.press('ArrowRight');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    await expect
      .poll(() => root.evaluate(() => getSelection()?.rangeCount))
      .toBe(0);

    await page.keyboard.press('ArrowRight');
    await expect.poll(modelSelection).toMatchObject({
      anchor: captionStart,
      focus: captionStart,
      kind: 'text',
    });

    await page.keyboard.press('ArrowLeft');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });

    await page.keyboard.press('ArrowLeft');
    await expect.poll(modelSelection).toMatchObject({
      anchor: beforeEnd,
      focus: beforeEnd,
      kind: 'text',
    });

    await root.locator('figure img').first().click();
    await page.keyboard.press('ArrowDown');
    await expect.poll(modelSelection).toMatchObject({
      anchor: captionStart,
      focus: captionStart,
      kind: 'text',
    });
    await page.keyboard.press('ArrowUp');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    expect(value.children[imageIndex + 1]).toMatchObject({
      children: [{ text: '' }],
      type: 'file',
    });
    expect(value.children[imageIndex + 2]).toMatchObject({
      children: [{ text: '' }],
      type: 'audio',
    });

    const captionEnd = {
      offset: value.children[imageIndex].children![0].text!.length,
      path: [imageIndex, 0],
    };

    await editor.selection.select({
      anchor: captionEnd,
      focus: captionEnd,
    });
    await page.keyboard.press('ArrowRight');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex + 1]],
    });
    await page.keyboard.press('ArrowRight');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex + 2]],
    });
    await page.keyboard.press('ArrowLeft');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex + 1]],
    });
    await page.keyboard.press('ArrowLeft');
    await expect.poll(modelSelection).toMatchObject({
      anchor: captionEnd,
      focus: captionEnd,
      kind: 'text',
    });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('ArrowDown from the media demo paragraph stops on the image before its caption [EDIT-SEL-BLOCK-YIELD-001]', async ({
  page,
}, testInfo) => {
  await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(
    page,
    'media-caption:vertical-owner-entry',
    root
  );

  await editor.ready({ editor: 'visible', text: 'Image caption' });
  const value = (await editor.get.modelValue()) as {
    children: Array<{
      children?: Array<{ text?: string }>;
      type?: string;
    }>;
  };
  const imageIndex = value.children.findIndex((node) => node.type === 'image');

  expect(imageIndex).toBeGreaterThan(0);
  const previous = value.children[imageIndex - 1].children!;
  const lastTextIndex = previous.length - 1;
  const beforeEnd = {
    offset: previous[lastTextIndex].text!.length,
    path: [imageIndex - 1, lastTextIndex],
  };
  const modelSelection = () =>
    root.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );

  await editor.selection.selectDOM({ anchor: beforeEnd, focus: beforeEnd });
  await page.keyboard.press('ArrowDown');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[imageIndex]],
  });
  await expect(root.locator('figure img').first()).toHaveClass(/ring-2/);
  await page.screenshot({ path: testInfo.outputPath('arrowdown-image.png') });
  await page.keyboard.press('ArrowDown');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { offset: 0, path: [imageIndex, 0] },
    focus: { offset: 0, path: [imageIndex, 0] },
    kind: 'text',
  });
  await page.keyboard.type('!');
  await expect
    .poll(async () => {
      const updated = (await editor.get.modelValue()) as typeof value;

      return updated.children[imageIndex].children?.[0]?.text;
    })
    .toBe('!Image caption');
});

test('ArrowUp from below a populated image visits its caption before the owner', async ({
  page,
}, testInfo) => {
  await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(
    page,
    'media-caption:vertical-owner-reverse-entry',
    root
  );

  await editor.ready({ editor: 'visible', text: 'Image caption' });
  const value = (await editor.get.modelValue()) as {
    children: Array<{
      children?: Array<{ text?: string }>;
      type?: string;
    }>;
  };
  const imageIndex = value.children.findIndex((node) => node.type === 'image');
  const below = value.children[imageIndex + 1].children!;
  const lastTextIndex = below.length - 1;
  const belowPoint = {
    offset: below[lastTextIndex].text!.length,
    path: [imageIndex + 1, lastTextIndex],
  };
  const modelSelection = () =>
    root.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );

  await editor.selection.selectDOM({ anchor: belowPoint, focus: belowPoint });
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [imageIndex, 0] },
    focus: { path: [imageIndex, 0] },
    kind: 'text',
  });
  await expect
    .poll(() =>
      root.evaluate((element) => {
        const selection = element.ownerDocument.getSelection();

        return !!(
          selection?.anchorNode &&
          element
            .querySelector('figure figcaption')
            ?.contains(selection.anchorNode)
        );
      })
    )
    .toBe(true);
  const captionOffset = (
    (await modelSelection()) as { focus: { offset: number } }
  ).focus.offset;
  const captionText = value.children[imageIndex].children![0].text!;
  const editedCaption = `${captionText.slice(
    0,
    captionOffset
  )}!${captionText.slice(captionOffset)}`;

  await page.keyboard.type('!');
  await expect
    .poll(async () => {
      const updated = (await editor.get.modelValue()) as typeof value;

      return updated.children[imageIndex].children?.[0]?.text;
    })
    .toBe(editedCaption);
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[imageIndex]],
  });
  await expect(root.locator('figure img').first()).toHaveClass(/ring-2/);
  await page.screenshot({ path: testInfo.outputPath('arrowup-image.png') });
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [imageIndex - 1, expect.any(Number)] },
    focus: { path: [imageIndex - 1, expect.any(Number)] },
    kind: 'text',
  });
  await page.keyboard.press('ArrowDown');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[imageIndex]],
  });
  await page.keyboard.press('ArrowDown');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { offset: 0, path: [imageIndex, 0] },
    focus: { offset: 0, path: [imageIndex, 0] },
    kind: 'text',
  });
  await page.keyboard.type('?');
  await expect
    .poll(async () => {
      const updated = (await editor.get.modelValue()) as typeof value;

      return updated.children[imageIndex].children?.[0]?.text;
    })
    .toBe(`?${editedCaption}`);
  const belowStart = { offset: 0, path: [imageIndex + 1, 0] };

  await editor.selection.selectDOM({ anchor: belowStart, focus: belowStart });
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [imageIndex, 0] },
    focus: { path: [imageIndex, 0] },
    kind: 'text',
  });
});

for (const mediaType of ['file', 'audio', 'video']) {
  test(`arrow keys skip an empty ${mediaType} caption`, async ({ page }) => {
    await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
    const root = page.locator(EDITOR).first();
    const editor = createBrowserEditorHarness(
      page,
      `media-caption:empty-${mediaType}-reverse-entry`,
      root
    );

    await editor.ready({ editor: 'visible', text: 'Image caption' });
    const value = (await editor.get.modelValue()) as {
      children: Array<{
        children?: Array<{ text?: string }>;
        type?: string;
      }>;
    };
    const mediaIndex = value.children.findIndex(
      (node) => node.type === mediaType
    );
    const belowStart = { offset: 0, path: [mediaIndex + 1, 0] };
    const modelSelection = () =>
      root.evaluate(
        (element, key) =>
          (
            element as HTMLElement &
              Record<string, { getModelSelection: () => unknown } | undefined>
          )[key]?.getModelSelection(),
        BROWSER_HANDLE_KEY
      );

    expect(mediaIndex).toBeGreaterThan(0);
    expect(value.children[mediaIndex].children).toEqual([{ text: '' }]);
    await editor.selection.selectDOM({ anchor: belowStart, focus: belowStart });
    await page.keyboard.press('ArrowUp');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[mediaIndex]],
    });
    await page.keyboard.press('ArrowDown');
    await expect.poll(modelSelection).toMatchObject({
      anchor: belowStart,
      focus: belowStart,
      kind: 'text',
    });
    await page.keyboard.press('ArrowLeft');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[mediaIndex]],
    });
    await page.keyboard.press('ArrowRight');
    await expect.poll(modelSelection).toMatchObject({
      anchor: belowStart,
      focus: belowStart,
      kind: 'text',
    });
    if (mediaType === 'file') {
      await editor.selection.select({
        anchor: { offset: 0, path: [mediaIndex, 0] },
        focus: { offset: 0, path: [mediaIndex, 0] },
      });
      await page.keyboard.type('Report caption');
      await expect
        .poll(async () => {
          const updated = (await editor.get.modelValue()) as typeof value;

          return updated.children[mediaIndex].children?.[0]?.text;
        })
        .toBe('Report caption');
      await editor.selection.selectDOM({
        anchor: belowStart,
        focus: belowStart,
      });
      await page.keyboard.press('ArrowUp');
      await expect.poll(modelSelection).toMatchObject({
        anchor: { path: [mediaIndex, 0] },
        focus: { path: [mediaIndex, 0] },
        kind: 'text',
      });
    }
  });
}

for (const [hide, { css, style }] of Object.entries(HIDDEN_CAPTIONS)) {
  test(`ArrowUp from below selects an image whose caption app CSS hides with ${hide} [EDIT-CAPTION-NAV-006]`, async ({
    page,
  }) => {
    const { blockStyle, editor, modelSelection, nativeRangeCount, value } =
      await openMediaEditor(
        page,
        '/blocks/media-demo',
        `hidden-caption-${hide}-reverse-entry`
      );
    const imageIndex = value.children.findIndex(
      (node) => node.type === 'image'
    );
    const belowStart = { offset: 0, path: [imageIndex + 1, 0] };

    await page.addStyleTag({ content: css });
    await expect
      .poll(() => blockStyle(imageIndex, 'figcaption'))
      .toMatchObject(style);
    await editor.selection.selectDOM({ anchor: belowStart, focus: belowStart });
    await page.keyboard.press('ArrowUp');
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    await expect.poll(nativeRangeCount).toBe(0);
  });
}

for (const [key, row] of [
  ['ArrowDown', 'EDIT-CAPTION-NAV-001'],
  ['ArrowRight', 'EDIT-CAPTION-NAV-003'],
] as const) {
  test(`${key} from a selected image skips a caption app CSS hides [${row}]`, async ({
    page,
  }) => {
    const { blockStyle, blockText, modelSelection, root, value } =
      await openMediaEditor(
        page,
        '/blocks/media-demo',
        `hidden-caption-owner-${key}`
      );
    const imageIndex = value.children.findIndex(
      (node) => node.type === 'image'
    );
    const afterStart = { offset: 0, path: [imageIndex + 1, 0] };
    const afterText = value.children[imageIndex + 1].children![0].text!;

    await page.addStyleTag({ content: HIDDEN_CAPTIONS.display.css });
    await expect
      .poll(() => blockStyle(imageIndex, 'figcaption'))
      .toMatchObject({ display: 'none' });
    await root.locator('figure img').first().click();
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    await page.keyboard.press(key);
    await expect.poll(modelSelection).toMatchObject({
      anchor: afterStart,
      focus: afterStart,
      kind: 'text',
    });
    await page.keyboard.type('Q');
    await expect
      .poll(() =>
        Promise.all([blockText(imageIndex), blockText(imageIndex + 1)])
      )
      .toEqual(['Image caption', `Q${afterText}`]);
  });
}

test('ArrowLeft from the block after an image selects it when app CSS hides its caption [EDIT-CAPTION-NAV-003]', async ({
  page,
}) => {
  const { blockStyle, editor, modelSelection, nativeRangeCount, value } =
    await openMediaEditor(
      page,
      '/blocks/media-demo',
      'hidden-caption-backward-entry'
    );
  const imageIndex = value.children.findIndex((node) => node.type === 'image');
  const afterStart = { offset: 0, path: [imageIndex + 1, 0] };

  await page.addStyleTag({ content: HIDDEN_CAPTIONS.display.css });
  await expect
    .poll(() => blockStyle(imageIndex, 'figcaption'))
    .toMatchObject({ display: 'none' });
  await editor.selection.selectDOM({ anchor: afterStart, focus: afterStart });
  await page.keyboard.press('ArrowLeft');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[imageIndex]],
  });
  await expect.poll(nativeRangeCount).toBe(0);
});

test('ArrowUp from below enters an empty caption the app keeps visible [EDIT-CAPTION-NAV-005]', async ({
  page,
}) => {
  const {
    blockStyle,
    blockText,
    caretInCaption,
    editor,
    modelSelection,
    root,
    value,
  } = await openMediaEditor(
    page,
    '/blocks/media-demo',
    'visible-empty-caption'
  );
  const fileIndex = value.children.findIndex((node) => node.type === 'file');
  const belowStart = { offset: 0, path: [fileIndex + 1, 0] };
  const captionStart = { offset: 0, path: [fileIndex, 0] };

  expect(value.children[fileIndex].children).toEqual([{ text: '' }]);
  await editor.selection.selectDOM({ anchor: belowStart, focus: belowStart });
  await root.evaluate((element, path) => {
    element
      .querySelector(`[data-editor-path="${path}"] figcaption`)
      ?.removeAttribute('hidden');
  }, fileIndex);
  await expect
    .poll(() => blockStyle(fileIndex, 'figcaption'))
    .not.toMatchObject({ display: 'none' });
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: captionStart,
    focus: captionStart,
    kind: 'text',
  });
  await expect.poll(() => caretInCaption(fileIndex)).toBe(true);
  await page.keyboard.type('R');
  await expect.poll(() => blockText(fileIndex)).toBe('R');
});

test('ArrowUp from selected audio selects the file above while its empty caption is hidden [EDIT-CAPTION-NAV-006]', async ({
  page,
}) => {
  const { blockStyle, editor, modelSelection, nativeRangeCount, value } =
    await openMediaEditor(page, '/blocks/editor-ai', 'media-reverse-entry');
  const imageIndex = value.children.findIndex(
    (node) =>
      node.type === 'image' &&
      node.children?.[0]?.text === 'Images with captions provide context.'
  );
  const fileIndex = imageIndex + 1;
  const audioIndex = imageIndex + 2;
  const fileCaptionStart = { offset: 0, path: [fileIndex, 0] };

  expect(value.children[fileIndex]).toMatchObject({
    children: [{ text: '' }],
    type: 'file',
  });
  expect(value.children[audioIndex]).toMatchObject({ type: 'audio' });
  await editor.selection.select({
    anchor: fileCaptionStart,
    focus: fileCaptionStart,
  });
  await page.keyboard.press('ArrowRight');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[audioIndex]],
  });
  await expect
    .poll(() => blockStyle(fileIndex, 'figcaption'))
    .toMatchObject({ display: 'none' });
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[fileIndex]],
  });
  await expect.poll(nativeRangeCount).toBe(0);
});

test('ArrowLeft at the end of an RTL paragraph in an LTR editor stops on the image after it [EDIT-CAPTION-NAV-003]', async ({
  page,
}) => {
  const { editor, imageIndex, modelSelection, paragraphIndex, setup } =
    await openArabicParagraphBeforeImage(page, 'rtl-paragraph-owner-stop');
  const end = { offset: ARABIC.length, path: [paragraphIndex, 0] };

  expect(setup).toEqual(RTL_PARAGRAPH_SETUP);
  await editor.selection.selectDOM({ anchor: end, focus: end });
  await page.keyboard.press('ArrowLeft');
  await expect.poll(modelSelection).toMatchObject({
    kind: 'node',
    paths: [[imageIndex]],
  });
});

test('ArrowRight at the end of an RTL paragraph in an LTR editor moves back one character', async ({
  page,
}) => {
  const { editor, modelSelection, paragraphIndex, setup } =
    await openArabicParagraphBeforeImage(page, 'rtl-paragraph-plain-move');
  const end = { offset: ARABIC.length, path: [paragraphIndex, 0] };
  const previous = { offset: ARABIC.length - 1, path: [paragraphIndex, 0] };

  expect(setup).toEqual(RTL_PARAGRAPH_SETUP);
  await editor.selection.selectDOM({ anchor: end, focus: end });
  await page.keyboard.press('ArrowRight');
  await expect.poll(modelSelection).toMatchObject({
    anchor: previous,
    focus: previous,
    kind: 'text',
  });
});

test('ArrowLeft collapses a selection in an RTL paragraph to its logical end', async ({
  page,
}) => {
  const { editor, modelSelection, paragraphIndex, setup } =
    await openArabicParagraphBeforeImage(page, 'rtl-paragraph-collapse');
  const start = { offset: 2, path: [paragraphIndex, 0] };
  const end = { offset: 6, path: [paragraphIndex, 0] };

  expect(setup).toEqual(RTL_PARAGRAPH_SETUP);
  await editor.selection.selectDOM({ anchor: start, focus: end });
  await expect.poll(modelSelection).toMatchObject({
    anchor: start,
    focus: end,
    kind: 'text',
  });
  await page.keyboard.press('ArrowLeft');
  await expect.poll(modelSelection).toMatchObject({
    anchor: end,
    focus: end,
    kind: 'text',
  });
});

test('ArrowUp stays in a wrapped paragraph below media until its first line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(
    page,
    'media-caption:wrapped-reverse-entry',
    root
  );

  await editor.ready({ editor: 'visible', text: 'Image caption' });
  const value = (await editor.get.modelValue()) as {
    children: Array<{
      children?: Array<{ text?: string }>;
      type?: string;
    }>;
  };
  const imageIndex = value.children.findIndex((node) => node.type === 'image');
  const paragraphIndex = imageIndex + 1;
  const paragraph = value.children[paragraphIndex].children!;
  const lastTextIndex = paragraph.length - 1;
  const paragraphEnd = {
    offset: paragraph[lastTextIndex].text!.length,
    path: [paragraphIndex, lastTextIndex],
  };
  const modelSelection = () =>
    root.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );
  const lineCount = await root.evaluate((element, index) => {
    const text = element.querySelector(`[data-editor-path="${index},0"]`);
    const range = element.ownerDocument.createRange();

    if (!text) return 0;

    range.selectNodeContents(text);

    return new Set(
      Array.from(range.getClientRects(), (rect) => Math.round(rect.top))
    ).size;
  }, paragraphIndex);

  expect(lineCount).toBeGreaterThan(1);
  await editor.selection.selectDOM({
    anchor: paragraphEnd,
    focus: paragraphEnd,
  });
  const belowTop = await nativeCaretTop(root);

  expect(belowTop).not.toBeNull();
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [paragraphIndex, expect.any(Number)] },
    focus: { path: [paragraphIndex, expect.any(Number)] },
    kind: 'text',
  });
  expect(await nativeCaretTop(root)).toBeLessThan(belowTop!);
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [imageIndex, 0] },
    focus: { path: [imageIndex, 0] },
    kind: 'text',
  });
});

test('ArrowUp moves through a wrapped caption before selecting its media owner', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(
    page,
    'media-caption:wrapped-caption-reverse-entry',
    root
  );

  await editor.ready({ editor: 'visible', text: 'Image caption' });
  const value = (await editor.get.modelValue()) as {
    children: Array<{
      children?: Array<{ text?: string }>;
      type?: string;
    }>;
  };
  const imageIndex = value.children.findIndex((node) => node.type === 'image');
  const captionEnd = {
    offset: value.children[imageIndex].children![0].text!.length,
    path: [imageIndex, 0],
  };
  const modelSelection = () =>
    root.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );

  await editor.selection.selectDOM({ anchor: captionEnd, focus: captionEnd });
  await page.keyboard.type(
    ' with enough descriptive text to wrap onto several lines in a narrow editor'
  );
  const lineCount = await root.evaluate((element, index) => {
    const text = element.querySelector(`[data-editor-path="${index},0"]`);
    const range = element.ownerDocument.createRange();

    if (!text) return 0;

    range.selectNodeContents(text);

    return new Set(
      Array.from(range.getClientRects(), (rect) => Math.round(rect.top))
    ).size;
  }, imageIndex);

  expect(lineCount).toBeGreaterThan(1);
  const captionBottomTop = await nativeCaretTop(root);

  expect(captionBottomTop).not.toBeNull();
  await page.keyboard.press('ArrowUp');
  await expect.poll(modelSelection).toMatchObject({
    anchor: { path: [imageIndex, 0] },
    focus: { path: [imageIndex, 0] },
    kind: 'text',
  });
  expect(await nativeCaretTop(root)).toBeLessThan(captionBottomTop!);
  for (let index = 1; index <= lineCount; index++) {
    await page.keyboard.press('ArrowUp');
    const selection = (await modelSelection()) as {
      focus?: { path: number[] };
      kind: string;
      paths?: number[][];
    };

    if (selection.kind === 'node') {
      expect(selection.paths).toEqual([[imageIndex]]);
      break;
    }
    expect(selection.kind).toBe('text');
    expect(selection.focus?.path[0]).toBe(imageIndex);
    expect(index).toBeLessThan(lineCount);
  }
});

test('media resize handles remain visible over the image caption', async ({
  page,
}) => {
  await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
  const editor = page.locator(EDITOR).first();
  const harness = createBrowserEditorHarness(
    page,
    'media-caption:resize-hover',
    editor
  );
  await harness.ready({ editor: 'visible', text: 'sample.pdf' });
  const figure = editor
    .locator('figure')
    .filter({ has: page.locator('img') })
    .first();
  await figure.locator('img').click();
  const caption = figure.locator('figcaption');
  await expect(caption).toBeVisible();
  const handles = figure.getByLabel('Resize media');
  await expect(handles).toHaveCount(2);
  const opacities = () =>
    handles.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element, '::after').opacity)
    );

  await page.mouse.move(0, 0);
  await expect.poll(opacities).toEqual(['0', '0']);
  await caption.hover();
  await expect.poll(opacities).toEqual(['1', '1']);
  await figure.locator('img').hover();
  await expect.poll(opacities).toEqual(['1', '1']);
  await page.mouse.move(0, 0);
  await expect.poll(opacities).toEqual(['0', '0']);
});

const openMediaDocs = async (page: Page) => {
  await page.goto('/docs/media', { waitUntil: 'commit' });
  const editor = page.locator(EDITOR).first();

  await expect(editor.locator('figure').first()).toBeVisible({
    timeout: 30_000,
  });

  const block = (text: string) =>
    editor
      .locator('[data-editor-node="element"]')
      .filter({ hasText: text })
      .first();
  const modelSelection = () =>
    editor.evaluate(
      (element, key) =>
        (
          element as HTMLElement &
            Record<string, { getModelSelection: () => unknown } | undefined>
        )[key]?.getModelSelection(),
      BROWSER_HANDLE_KEY
    );
  const blockTypes = () =>
    editor.evaluate((element, key) => {
      const value = (
        element as HTMLElement &
          Record<string, { getValue: () => unknown } | undefined>
      )[key]?.getValue() as
        | { children: Array<{ type: string }> }
        | Array<{ type: string }>
        | undefined;
      const children = Array.isArray(value) ? value : (value?.children ?? []);

      return children.map((node) => node.type);
    }, BROWSER_HANDLE_KEY);
  const marquee = async (from: Locator, to: Locator) => {
    await from.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' })
    );
    const start = await from.boundingBox();
    const end = await to.boundingBox();

    if (!start || !end) throw new Error('Missing media block box');
    await page.mouse.move(start.x - 60, start.y + 4);
    await page.mouse.down();
    await page.mouse.move(start.x + 80, end.y + end.height - 4, { steps: 12 });
    await page.mouse.up();
  };

  return {
    audio: editor.locator('.editor-audio').first(),
    blockTypes,
    editor,
    file: editor.locator('.editor-file').first(),
    highlights: page.locator('[data-slot="node-selection-highlight"]'),
    image: editor.locator('.editor-image').first(),
    marquee,
    modelSelection,
    paragraph: block('Customize image captions and resize images.'),
    rings: editor.locator('.ring-2'),
    toolbar: page.getByRole('button', { name: 'Edit link', exact: true }),
  };
};

test('a marquee over one media block paints it blue with no ring or toolbar', async ({
  page,
}, info) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const media = await openMediaDocs(page);

    await media.marquee(media.file, media.file);
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block' });
    await expect(
      media.file.locator('[data-slot="node-selection-highlight"]')
    ).toHaveCount(1);
    await expect(media.toolbar).toHaveCount(0);
    await expect(media.rings).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('one-file.png') });

    await media.marquee(media.image, media.audio);
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block' });
    for (const block of [media.image, media.file, media.audio]) {
      await expect(
        block.locator('[data-slot="node-selection-highlight"]')
      ).toHaveCount(1);
    }
    await expect(media.toolbar).toHaveCount(0);
    await expect(media.rings).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('three-media.png') });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('clicking an image makes an object pick that block gestures turn blue', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const media = await openMediaDocs(page);
    const img = media.image.locator('img');

    await img.click();
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'object' });
    await expect(img).toHaveClass(/ring-2/);
    await expect(media.toolbar).toBeVisible();
    await expect(media.highlights).toHaveCount(0);

    await media.image.hover();
    await media.image
      .locator('xpath=ancestor::*[contains(@class,"editor-draggable")][1]')
      .getByRole('button', { name: 'Drag block', exact: true })
      .first()
      .click();
    await page.keyboard.press('Escape');
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block', paths: [[2]] });
    await expect(
      media.image.locator('[data-slot="node-selection-highlight"]')
    ).toHaveCount(1);
    await expect(img).not.toHaveClass(/ring-2/);
    await expect(media.toolbar).toHaveCount(0);

    await media.marquee(media.image, media.image);
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block', paths: [[2]] });
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block', paths: [[3]] });
    await expect(
      media.paragraph.locator('[data-slot="node-selection-highlight"]')
    ).toHaveCount(1);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('focusing native audio controls makes an object pick', async ({
  page,
}) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const media = await openMediaDocs(page);

    await media.audio.locator('audio').focus();
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'object', paths: [[8]] });
    await expect(media.highlights).toHaveCount(0);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test('dropping a dragged image leaves a block pick on it', async ({ page }) => {
  const errors = recordBrowserRuntimeErrors(page);

  try {
    const media = await openMediaDocs(page);

    await media.image.locator('img').click();
    const before = await media.blockTypes();
    const picked = (await media.modelSelection()) as { paths: number[][] };
    const imageType = before[picked.paths[0][0]];
    await media.image.hover();
    const handle = media.image
      .locator('xpath=ancestor::*[contains(@class,"editor-draggable")][1]')
      .getByRole('button', { name: 'Drag block', exact: true })
      .first();
    const from = await handle.boundingBox();
    const to = await media.paragraph.boundingBox();

    if (!from || !to) throw new Error('Missing drag boxes');
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + 120, to.y + to.height - 2, { steps: 12 });
    await page.mouse.up();

    await expect.poll(media.blockTypes).not.toEqual(before);
    await expect
      .poll(media.modelSelection)
      .toMatchObject({ kind: 'node', mode: 'block' });
    const landed = (await media.modelSelection()) as { paths: number[][] };
    expect(landed.paths).toHaveLength(1);
    const after = await media.blockTypes();
    expect(after[landed.paths[0][0]]).toBe(imageType);
    await expect(
      media.image.locator('[data-slot="node-selection-highlight"]')
    ).toHaveCount(1);
    await expect(media.toolbar).toHaveCount(0);
    errors.assertNone();
  } finally {
    errors.stop();
  }
});

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR).first();
    const editorHarness = createBrowserEditorHarness(page, CASE_ID, editor);

    await editorHarness.ready({ editor: 'visible', text: 'sample.pdf' });

    const initialBlocks = await editorHarness.get.modelBlockTexts();
    const mediaHeadingIndex = initialBlocks.indexOf('Images and Media');

    expect(mediaHeadingIndex).toBeGreaterThanOrEqual(0);

    const file = editor.getByRole('link', {
      name: 'sample.pdf',
      exact: true,
    });
    const mediaHeading = editor
      .locator('h3')
      .filter({ hasText: 'Images and Media' })
      .first();
    const tocItem = editor.getByRole('button', {
      name: 'Images and Media',
      exact: true,
    });

    await file.click();
    await tocItem.click();

    runtimeErrors.assertNone();
    await expect(editor).toBeVisible();
    await expect(mediaHeading).toBeVisible();

    const headingText = mediaHeading.locator('[data-editor-string="true"]');
    const headingBox = await headingText.boundingBox();

    expect(headingBox).not.toBeNull();
    await headingText.click({
      position: {
        x: Math.max(1, (headingBox?.width ?? 1) - 1),
        y: Math.max(1, (headingBox?.height ?? 1) / 2),
      },
    });
    await expect(editor).toBeFocused();
    await expect
      .poll(() =>
        headingText.evaluate((element) => {
          const selection = getSelection();

          return {
            collapsed: selection?.isCollapsed ?? false,
            inside: Boolean(
              selection?.anchorNode && element.contains(selection.anchorNode)
            ),
          };
        })
      )
      .toEqual({ collapsed: true, inside: true });
    await page.keyboard.type('!');

    await expect(mediaHeading).toHaveText('Images and Media!');
    await editorHarness.assert.modelBlockText(
      mediaHeadingIndex,
      'Images and Media!'
    );
    await page.keyboard.press('ControlOrMeta+z');
    await expect(mediaHeading).toHaveText('Images and Media');
    await editorHarness.assert.modelBlockText(
      mediaHeadingIndex,
      'Images and Media'
    );
  } finally {
    runtimeErrors.stop();
  }
});
