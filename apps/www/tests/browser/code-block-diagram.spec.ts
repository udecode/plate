import { readFile } from 'node:fs/promises';

import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
  type BrowserEditorHarness,
} from '@platejs/test/playwright';
import type { Locator, Page } from '@playwright/test';

const ABOVE = 'Above the diagram';
const SOURCE = 'graph TD\n  A-->B\n  B-->C';
const LAST_LINE = SOURCE.lastIndexOf('\n') + 1;
const GANTT = [
  'gantt',
  '  dateFormat YYYY-MM-DD',
  '  section Build',
  '    Write :a1, 2026-01-01, 10d',
  '    Review :after a1, 5d',
].join('\n');

type Variant = 'codemirror' | 'native';

async function open(
  page: Page,
  { query = '', variant = 'native' }: { query?: string; variant?: Variant } = {}
) {
  await page.goto(`/dev/code-block-diagram?variant=${variant}${query}`, {
    waitUntil: 'commit',
  });
  const root = page.locator('.editor-editor').first();
  const editor = createBrowserEditorHarness(page, 'code-block-diagram', root);

  await editor.ready({ editor: 'visible', text: ABOVE });

  const block = root.locator('.editor-codeBlock');

  return {
    block,
    editor,
    picture: block.locator('img'),
    source: block.locator(
      variant === 'native' ? 'pre' : '[data-code-block-codemirror]'
    ),
    view: (name: 'Both' | 'Code') =>
      block.getByRole('button', { exact: true, name }),
  };
}

const focusPath = async (editor: BrowserEditorHarness) => {
  const selection = await editor.selection.get();

  return selection?.focus.path ?? null;
};

const pictureSvg = async (picture: Locator) => {
  const src = (await picture.getAttribute('src')) ?? '';

  return Buffer.from(src.slice(src.indexOf(',') + 1), 'base64').toString(
    'utf-8'
  );
};

type RenderProbeWindow = Window & {
  __diagramInFlight?: number;
  __diagramMaxInFlight?: number;
  __diagramRenders?: string[];
  __releaseRenders?: () => void;
};

const renderedSources = (page: Page) =>
  page.evaluate(() => (window as RenderProbeWindow).__diagramRenders ?? []);

const rendersInFlight = (page: Page) =>
  page.evaluate(() => (window as RenderProbeWindow).__diagramInFlight ?? 0);

const maxRendersInFlight = (page: Page) =>
  page.evaluate(() => (window as RenderProbeWindow).__diagramMaxInFlight ?? 0);

const releaseRenders = (page: Page) =>
  page.evaluate(() => (window as RenderProbeWindow).__releaseRenders?.());

const afterIdle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(() => resolve());
        } else {
          setTimeout(resolve, 0);
        }
      })
  );

async function openHeld(page: Page) {
  const opened = await open(page, { query: '&hold=1' });

  await expect.poll(() => renderedSources(page)).toEqual([SOURCE]);
  await releaseRenders(page);
  await expect(opened.picture).toBeVisible();
  await resetRenderProbe(page);
  await opened.editor.selection.collapse({
    path: [1, 0],
    offset: SOURCE.length,
  });
  await opened.editor.focus();

  return opened;
}

const resetRenderProbe = (page: Page) =>
  page.evaluate(() => {
    Object.assign(window, { __diagramMaxInFlight: 0, __diagramRenders: [] });
  });

async function exportPng(page: Page, block: Locator) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    block.getByRole('button', { name: 'Export PNG' }).click(),
  ]);
  const png = await readFile(await download.path());

  return page.evaluate(async (base64) => {
    const image = new Image();

    image.src = `data:image/png;base64,${base64}`;
    await image.decode();

    const canvas = document.createElement('canvas');

    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d')!;

    context.drawImage(image, 0, 0);

    const { data } = context.getImageData(0, 0, image.width, image.height);
    let painted = 0;

    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 0) painted += 1;
    }

    return { height: image.height, painted, width: image.width };
  }, png.toString('base64'));
}

for (const variant of ['native', 'codemirror'] as const) {
  test.describe(`${variant} diagram`, () => {
    test('ArrowDown leaves the source past the picture', async ({ page }) => {
      const errors = recordBrowserRuntimeErrors(page);

      try {
        const { editor, picture } = await open(page, { variant });

        await expect(picture).toBeVisible();
        await editor.selection.collapse({
          path: [1, 0],
          offset: SOURCE.length,
        });
        await editor.focus();
        await page.keyboard.press('ArrowDown');
        await expect.poll(() => focusPath(editor)).toEqual([2, 0]);
        errors.assertNone();
      } finally {
        errors.stop();
      }
    });

    test('typing in Both redraws the picture from the new source', async ({
      page,
    }) => {
      const { editor, picture } = await open(page, { variant });

      await expect(picture).toBeVisible();
      expect(await pictureSvg(picture)).not.toContain('>CX<');
      await editor.selection.collapse({ path: [1, 0], offset: SOURCE.length });
      await editor.focus();
      await page.keyboard.type('X');
      await expect.poll(() => editor.get.modelBlockText(1)).toBe(`${SOURCE}X`);
      await expect.poll(() => pictureSvg(picture)).toContain('>CX<');
    });

    test('select-all and copy put the diagram source on the clipboard', async ({
      page,
    }, info) => {
      test.skip(info.project.name !== 'chromium', 'native clipboard');
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write']);

      const { editor, picture } = await open(page, { variant });

      await expect(picture).toBeVisible();
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await editor.focus();
      await page.keyboard.press('ControlOrMeta+a');
      await expect.poll(() => focusPath(editor)).toEqual([2, 0]);
      await page.keyboard.press('ControlOrMeta+c');
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain(SOURCE);
    });

    test('read-only shows the source and the picture, or the error when the render fails', async ({
      page,
    }) => {
      const valid = await open(page, { query: '&readOnly=1', variant });

      await expect(valid.source).toBeVisible();
      await expect(valid.picture).toBeVisible();

      const broken = await open(page, {
        query: `&readOnly=1&source=${encodeURIComponent('graph TD\n  A--')}`,
        variant,
      });

      await expect(broken.source).toBeVisible();
      await expect(broken.block.locator('.text-destructive')).toBeVisible();
      await expect(broken.picture).toHaveCount(0);
    });
  });
}

test('ArrowDown from above enters the source on its first line', async ({
  page,
}, info) => {
  test.skip(
    info.project.name === 'firefox',
    'Firefox lands ArrowDown at the end of any multi-line code block (t_8b029a28)'
  );

  const { editor, picture } = await open(page);

  await expect(picture).toBeVisible();
  await editor.selection.collapse({ path: [0, 0], offset: ABOVE.length });
  await editor.focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => focusPath(editor)).toEqual([1, 0]);
  expect((await editor.selection.get())!.focus.offset).toBeLessThan(
    SOURCE.indexOf('\n') + 1
  );
});

test('ArrowUp from below crosses the picture to the last source line', async ({
  page,
}) => {
  const { editor, picture } = await open(page);

  await expect(picture).toBeVisible();
  await editor.selection.collapse({ path: [2, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => focusPath(editor)).toEqual([1, 0]);
  expect((await editor.selection.get())!.focus.offset).toBeGreaterThanOrEqual(
    LAST_LINE
  );
});

test('switching views leaves the document unchanged', async ({ page }) => {
  const { editor, picture, source, view } = await open(page);

  await expect(picture).toBeVisible();

  const before = await editor.get.modelValue();

  await view('Code').click();
  await expect(picture).toHaveCount(0);
  await expect(source).toBeVisible();
  await view('Both').click();
  await expect(source).toBeVisible();
  await expect(picture).toBeVisible();
  expect(await editor.get.modelValue()).toEqual(before);
});

test('Code stays Code through focus, typing and an emptied source, and renders nothing', async ({
  page,
}) => {
  const { editor, picture, source, view } = await open(page);

  await expect(picture).toBeVisible();
  await view('Code').click();
  await page.evaluate(() => {
    (window as Window & { __diagramRenders?: string[] }).__diagramRenders = [];
  });
  await editor.selection.collapse({ path: [1, 0], offset: SOURCE.length });
  await editor.focus();
  await page.keyboard.type('X');
  await expect.poll(() => editor.get.modelBlockText(1)).toBe(`${SOURCE}X`);

  for (let index = 0; index <= SOURCE.length; index += 1) {
    await page.keyboard.press('Backspace');
  }

  await expect.poll(() => editor.get.modelBlockText(1)).toBe('');
  await page.waitForTimeout(500);
  await expect(view('Code')).toHaveAttribute('aria-pressed', 'true');
  await expect(source).toBeVisible();
  await expect(picture).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __diagramRenders?: string[] }).__diagramRenders
          ?.length
    )
  ).toBe(0);
});

test('Export PNG writes a PNG of the picture', async ({ page }) => {
  const { block, picture } = await open(page, {
    query: `&language=graphviz&source=${encodeURIComponent('digraph { a -> b }')}`,
  });

  await expect(picture).toBeVisible();

  const png = await exportPng(page, block);

  expect(png.painted).toBeGreaterThan(100);
});

test('a renderer that resolves markup other than SVG shows an error instead of a picture', async ({
  page,
}) => {
  const { block, picture } = await open(page, { query: '&output=html' });

  await expect(block.locator('.text-destructive')).toHaveText(
    'The renderer did not return an SVG picture.'
  );
  await expect(picture).toHaveCount(0);
});

test('a source waiting behind a render does not start once the reader picks Code', async ({
  page,
}) => {
  const { view } = await openHeld(page);

  await page.keyboard.type('X');
  await expect.poll(() => renderedSources(page)).toEqual([`${SOURCE}X`]);
  await page.keyboard.type('Y');
  await afterIdle(page);
  await view('Code').click();
  await releaseRenders(page);
  await expect.poll(() => rendersInFlight(page)).toBe(0);
  await afterIdle(page);
  expect(await renderedSources(page)).toEqual([`${SOURCE}X`]);
});

test('a render aborted by an emptied source keeps its slot until it settles', async ({
  page,
}) => {
  const { editor, picture } = await openHeld(page);

  await page.keyboard.type('X');
  await expect.poll(() => renderedSources(page)).toEqual([`${SOURCE}X`]);

  for (let index = 0; index <= SOURCE.length; index += 1) {
    await page.keyboard.press('Backspace');
  }

  await expect.poll(() => editor.get.modelBlockText(1)).toBe('');
  await page.keyboard.type('graph LR; Q-->R');
  await afterIdle(page);
  expect(await renderedSources(page)).toEqual([`${SOURCE}X`]);
  await expect
    .poll(async () => {
      await releaseRenders(page);

      return pictureSvg(picture);
    })
    .toContain('>Q<');
  expect(await maxRendersInFlight(page)).toBe(1);
});

test('a Mermaid Gantt chart exports at the size its picture states', async ({
  page,
}) => {
  const { block, picture } = await open(page, {
    query: `&source=${encodeURIComponent(GANTT)}`,
  });

  await expect(picture).toBeVisible();

  const [, width] = /^<svg\b[^>]*\swidth="([^"]*)"/.exec(
    await pictureSvg(picture)
  )!;
  const png = await exportPng(page, block);

  expect(png.width).toBe(Number(width));
  expect(png.width).toBeGreaterThan(300);
  expect(png.painted).toBeGreaterThan(100);
});

test('a chain wider than a canvas exports a painted PNG scaled to the same shape', async ({
  page,
}) => {
  const chain = Array.from(
    { length: 400 },
    (_, index) => `n${index}[Task number ${index}]`
  ).join('-->');
  const { block, picture } = await open(page, {
    query: `&source=${encodeURIComponent(`graph LR\n  ${chain}`)}`,
  });

  await expect(picture).toBeVisible();

  const [, width, height] =
    /^<svg\b[^>]*\swidth="([^"]*)"[^>]*\sheight="([^"]*)"/.exec(
      await pictureSvg(picture)
    )!;

  expect(Number(width)).toBeGreaterThan(65_535);

  const png = await exportPng(page, block);

  expect(png.painted).toBeGreaterThan(100);
  expect(
    Math.abs(png.height - (png.width * Number(height)) / Number(width))
  ).toBeLessThanOrEqual(1);
});

test('a drawn block starts no render when Activity shows it again', async ({
  page,
}) => {
  const { picture } = await open(page, { query: '&activity=1' });

  await expect(picture).toBeVisible();
  await resetRenderProbe(page);
  await page.getByRole('button', { name: 'Hide editor' }).click();
  await page.getByRole('button', { name: 'Show editor' }).click();
  await expect(picture).toBeVisible();
  await afterIdle(page);
  await afterIdle(page);
  expect(await renderedSources(page)).toEqual([]);
});

test('a block Activity hid during a render draws once shown again', async ({
  page,
}) => {
  const { picture } = await open(page, { query: '&activity=1&hold=1' });

  await expect.poll(() => renderedSources(page)).toEqual([SOURCE]);
  await page.getByRole('button', { name: 'Hide editor' }).click();
  await page.getByRole('button', { name: 'Show editor' }).click();
  await expect
    .poll(async () => {
      await releaseRenders(page);

      return picture.count();
    })
    .toBe(1);
  await expect(picture).toBeVisible();
});
