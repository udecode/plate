import {
  type BrowserEditorHarness,
  createBrowserEditorHarness,
  DEFAULT_RUNTIME_ERROR_PATTERNS,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import {
  expect,
  type Locator,
  type Page,
  type TestInfo,
  test,
} from '@playwright/test';

const CASE_ID = 'pagination:plate-paged-editor-content';
const TOP_LEVEL_BLOCKS = '[data-editor-path]:not([data-editor-path*=","])';
const DEMO_PAGE_MARGIN = 72;

const openDemo = async (page: Page) => {
  // Marks the host as the parser inserts it, before hydration can replace it,
  // so a host swap at hydration or measurement shows.
  await page.addInitScript(() => {
    new MutationObserver((_, observer) => {
      const host = document.querySelector('[aria-label="Paged document"]');

      if (!host) return;
      Reflect.set(host, '__pagedHost', true);
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/blocks/pagination-demo');
  const root = page.getByRole('textbox', { name: 'Paged document' });
  const harness = createBrowserEditorHarness(page, CASE_ID, root);

  await harness.ready({ editor: 'visible', text: 'Paged documents' });
  await expect(page.getByTestId('pagination-page-count')).toHaveText(
    /^[2-9]\d* pages$/
  );
  return { harness, root };
};

// Every case also fails on a runtime error, a hydration mismatch included.
const demoTest = (
  title: string,
  body: (demo: {
    harness: BrowserEditorHarness;
    page: Page;
    root: Locator;
    testInfo: TestInfo;
  }) => Promise<void>
) =>
  test(title, async ({ page }, testInfo) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page, {
      patterns: [...DEFAULT_RUNTIME_ERROR_PATTERNS, "didn't match the client"],
    });

    try {
      const { harness, root } = await openDemo(page);

      await body({ harness, page, root, testInfo });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

const readBlock = (root: Locator, path: string) =>
  root.evaluate((host, blockPath) => {
    const block = host.querySelector<HTMLElement>(
      `[data-editor-path="${blockPath}"]`
    );
    const pages = [
      ...document.querySelectorAll<HTMLElement>('[data-editor-page]'),
    ].map((page) => page.getBoundingClientRect());

    return {
      runs: [
        ...(block?.querySelectorAll<HTMLElement>('[data-pagination-line]') ??
          []),
      ].map((run) => {
        const rect = run.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;

        return {
          bottom: rect.bottom,
          left: rect.left,
          page: pages.findIndex(
            (page) => center >= page.top && center <= page.bottom
          ),
          position: run.style.position,
          right: rect.right,
          text: run.textContent ?? '',
          top: rect.top,
        };
      }),
      text: [...(block?.querySelectorAll('[data-editor-string]') ?? [])]
        .map((string) => string.textContent)
        .join('')
        .replaceAll('﻿', ''),
    };
  }, path);

const blockPathByText = (root: Locator, prefix: string) =>
  root.evaluate(
    (host, text) =>
      [...host.querySelectorAll<HTMLElement>('[data-editor-node="element"]')]
        .find((element) => element.textContent?.startsWith(text))
        ?.getAttribute('data-editor-path') ?? '',
    prefix
  );

const caretPage = (page: Page) =>
  page.evaluate(() => {
    const selection = getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getClientRects()[0];
    const center = rect ? (rect.top + rect.bottom) / 2 : Number.NaN;

    return [...document.querySelectorAll('[data-editor-page]')].findIndex(
      (element) => {
        const bounds = element.getBoundingClientRect();

        return center >= bounds.top && center <= bounds.bottom;
      }
    );
  });

const pageCount = (page: Page) =>
  page.getByTestId('pagination-page-count').textContent();

test.describe('pagination demo', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Chromium paged layout proof'
  );

  demoTest(
    'keeps one paged host at the canvas width through a spread toggle',
    async ({ page, root }) => {
      expect(
        await root.evaluate((host) => {
          const paged = host.closest<HTMLElement>(
            '[data-editor-paged-editable]'
          );

          return {
            canvasWidth: Number.parseFloat(paged?.style.width ?? 'NaN'),
            hostWidth: host.getBoundingClientRect().width,
            pagedHosts:
              paged?.querySelectorAll('[contenteditable="true"][data-editor]')
                .length ?? 0,
          };
        })
      ).toEqual({ canvasWidth: 816, hostWidth: 816, pagedHosts: 1 });

      const pagesSingle = await pageCount(page);

      await page.getByLabel('Spread pages').check();
      await expect
        .poll(() =>
          page.evaluate(() => {
            const [first, second] = document.querySelectorAll<HTMLElement>(
              '[data-editor-page-surface]'
            );

            return Boolean(
              first && second && first.style.top === second.style.top
            );
          })
        )
        .toBe(true);
      expect(await pageCount(page)).toBe(pagesSingle);
      expect(
        await root.evaluate((host) => Reflect.get(host, '__pagedHost')),
        'the server-rendered host is still the paged host'
      ).toBe(true);
    }
  );

  demoTest(
    'paints marks and comments inside their projected runs',
    async ({ page, root, testInfo }) => {
      await expect(root.locator('h1')).toHaveText('Paged documents');
      expect(
        await root.evaluate((host) => {
          const painted = (element: HTMLElement | null) =>
            element?.closest<HTMLElement>('[data-pagination-line]')?.style
              .position === 'absolute' &&
            element.getBoundingClientRect().width > 0;

          return {
            comment: painted(
              host.querySelector('[data-comment-id="paged-comment"]')
            ),
            highlight: painted(host.querySelector('mark')),
          };
        })
      ).toEqual({ comment: true, highlight: true });

      const { runs: marked } = await readBlock(root, '1');
      const top = Math.min(...marked.map((run) => run.top));
      const left = Math.min(...marked.map((run) => run.left));

      await page.screenshot({
        clip: {
          height: Math.max(...marked.map((run) => run.bottom)) - top + 8,
          width: Math.max(...marked.map((run) => run.right)) - left + 8,
          x: left - 4,
          y: top - 4,
        },
        path: testInfo.outputPath('paged-marks.png'),
      });
    }
  );

  demoTest(
    'paints every run at its published rect without overlapping the next block',
    async ({ page, root }) => {
      await page.getByLabel('Show measured lines').check();
      const placement = await root.evaluate((host) => {
        const publishedRunRectsByPath = new Map<string, DOMRect[]>();

        for (const frame of document.querySelectorAll<HTMLElement>(
          '[data-testid="pagination-run-frame"]'
        )) {
          const path = frame.dataset.path!;

          publishedRunRectsByPath.set(path, [
            ...(publishedRunRectsByPath.get(path) ?? []),
            frame.getBoundingClientRect(),
          ]);
        }

        return [...publishedRunRectsByPath].map(([path, frames]) => {
          const runs = [
            ...host.querySelectorAll<HTMLElement>(
              `[data-editor-path="${path}"] [data-pagination-line]`
            ),
          ].map((run) => run.getBoundingClientRect());

          return {
            maxDelta: Math.max(
              ...frames.map((frame, index) =>
                Math.max(
                  Math.abs(frame.left - (runs[index]?.left ?? Number.NaN)),
                  Math.abs(frame.top - (runs[index]?.top ?? Number.NaN))
                )
              )
            ),
            path,
            sameCount: frames.length === runs.length,
          };
        });
      });

      expect(placement.map((block) => block.path)).toEqual(
        await root
          .locator(TOP_LEVEL_BLOCKS)
          .evaluateAll((blocks) =>
            blocks
              .filter((block) => !block.querySelector('table'))
              .map((block) => block.getAttribute('data-editor-path'))
          )
      );
      expect(
        placement.filter((block) => !block.sameCount || !(block.maxDelta <= 1))
      ).toEqual([]);

      expect(
        await root.evaluate((host, selector) => {
          const pages = [
            ...document.querySelectorAll<HTMLElement>('[data-editor-page]'),
          ].map((pageElement) => pageElement.getBoundingClientRect());
          const pageOf = (rect: DOMRect) =>
            pages.findIndex(
              (pageRect) =>
                (rect.top + rect.bottom) / 2 >= pageRect.top &&
                (rect.top + rect.bottom) / 2 <= pageRect.bottom
            );
          const blocks = [...host.querySelectorAll<HTMLElement>(selector)].map(
            (block) => {
              const runs = [
                ...block.querySelectorAll('[data-pagination-line]'),
              ].map((run) => run.getBoundingClientRect());

              return {
                path: block.dataset.editorPath,
                rects: runs.length > 0 ? runs : [block.getBoundingClientRect()],
              };
            }
          );

          return blocks.flatMap((block, index) => {
            const next = blocks[index + 1];
            const last = block.rects.at(-1)!;
            const first = next?.rects[0];

            return first &&
              pageOf(last) === pageOf(first) &&
              last.bottom > first.top + 0.5
              ? [`${block.path} overlaps ${next.path}`]
              : [];
          });
        }, TOP_LEVEL_BLOCKS)
      ).toEqual([]);
    }
  );

  demoTest(
    'shows each drag handle beside its placed block',
    async ({ page, root }) => {
      const lastPath = String(
        (await root.locator(TOP_LEVEL_BLOCKS).count()) - 1
      );

      for (const path of [
        '1',
        await blockPathByText(root, 'A table shorter'),
        lastPath,
      ]) {
        const { runs } = await readBlock(root, path);
        const first = runs[0];

        await page.mouse.move(first.left + 4, (first.top + first.bottom) / 2);
        const handle = root
          .locator('.editor-draggable', {
            has: page.locator(`[data-editor-path="${path}"]`),
          })
          .getByRole('button', { name: 'Drag block' });

        await expect(handle).toBeVisible();
        const box = (await handle.boundingBox())!;
        const gap = first.left - (box.x + box.width);

        expect({
          beside: gap >= -1 && gap < 32,
          path,
          sameLine: Math.abs(box.y - first.top) < first.bottom - first.top,
        }).toEqual({ beside: true, path, sameLine: true });
      }
    }
  );

  demoTest(
    'moves a table shorter than a page to the next page whole',
    async ({ page, root }) => {
      const tablePages = () =>
        root.evaluate((host, margin) => {
          const table = host.querySelector('table')!.getBoundingClientRect();

          return [
            ...document.querySelectorAll<HTMLElement>('[data-editor-page]'),
          ]
            .filter((pageElement) => {
              const rect = pageElement.getBoundingClientRect();

              return table.top < rect.bottom && table.bottom > rect.top;
            })
            .map((pageElement) => {
              const rect = pageElement.getBoundingClientRect();
              const inside =
                table.top >= rect.top + margin - 0.5 &&
                table.bottom <= rect.bottom - margin + 0.5;

              return `${pageElement.dataset.editorPageIndex}${inside ? '' : ' overflows'}`;
            });
        }, DEMO_PAGE_MARGIN);
      const intro = await readBlock(
        root,
        await blockPathByText(root, 'A table shorter')
      );
      const last = intro.runs.at(-1)!;
      const seen: string[][] = [];

      await page.mouse.click(last.right - 1, (last.top + last.bottom) / 2);
      for (let presses = 0; presses < 40; presses++) {
        await page.keyboard.press('Enter');
        const current = await tablePages();

        seen.push(current);
        if (current[0] !== '0') break;
      }

      expect(seen.filter((pages) => pages.length !== 1)).toEqual([]);
      expect(seen.at(-1)).toEqual(['1']);
    }
  );

  demoTest(
    'bolds selected words with mod+b without overlapping the next run',
    async ({ page, root }) => {
      const path = await blockPathByText(root, 'A table shorter');
      const before = await readBlock(root, path);

      await page.mouse.click(before.runs[0].left + 1, before.runs[0].top + 4);
      for (const _ of 'A table') {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press('ControlOrMeta+b');
      await root.getByText('Paged documents').click();

      await expect(
        root.locator(`[data-editor-path="${path}"] strong`)
      ).toHaveText('A table');
      await expect
        .poll(async () => {
          const block = await readBlock(root, path);

          return block.runs.map((run) => run.text);
        })
        .toContain('A table');

      const bolded = await readBlock(root, path);
      const runs = [...bolded.runs].sort(
        (a, b) => a.top - b.top || a.left - b.left
      );

      for (const [index, run] of runs.entries()) {
        const next = runs[index + 1];

        if (next && Math.abs(next.top - run.top) < 1) {
          expect(run.right).toBeLessThanOrEqual(next.left + 0.5);
        }
      }
    }
  );

  demoTest(
    'types and composes at the end of a block split across two pages',
    async ({ harness, page, root }) => {
      const paths = await root
        .locator(TOP_LEVEL_BLOCKS)
        .evaluateAll((elements) =>
          elements.map((element) => element.getAttribute('data-editor-path')!)
        );
      let path = '';

      for (const candidate of paths) {
        const block = await readBlock(root, candidate);

        if (new Set(block.runs.map((run) => run.page)).size > 1) {
          path = candidate;
          break;
        }
      }
      expect(path).not.toBe('');

      await root
        .locator(`[data-editor-path="${path}"] [data-pagination-line]`)
        .last()
        .scrollIntoViewIfNeeded();
      const split = await readBlock(root, path);
      const boundary = split.runs.findLast((run) => run.page === 0)!;
      const last = split.runs.at(-1)!;

      await page.mouse.click(
        boundary.right - 1,
        (boundary.top + boundary.bottom) / 2
      );
      const pageBefore = await caretPage(page);

      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      const crossed = await harness.get.displayedSelection();

      expect({
        native: crossed.native.selection,
        pageAfter: await caretPage(page),
        pageBefore,
      }).toEqual({
        native: { anchor: crossed.model?.anchor, focus: crossed.model?.focus },
        pageAfter: 1,
        pageBefore: 0,
      });
      await page.mouse.click(last.right - 1, (last.top + last.bottom) / 2);
      await page.keyboard.type('XY');
      await harness.ime.compose({ steps: ['す', 'すし'], text: 'すし' });

      await expect
        .poll(async () => {
          const value = (await harness.get.modelValue()) as {
            children: Array<{ children: Array<{ text?: string }> }>;
          };
          const model = value.children[Number(path)].children
            .map((child) => child.text ?? '')
            .join('');
          const block = await readBlock(root, path);

          return {
            domMatchesModel: block.text === model,
            ending: model.slice(-4),
            pages: new Set(block.runs.map((run) => run.page)).size,
            projected: block.runs.every((run) => run.position === 'absolute'),
          };
        })
        .toEqual({
          domMatchesModel: true,
          ending: 'XYすし',
          pages: 2,
          projected: true,
        });
    }
  );

  demoTest(
    'stays editable without pages after a markdown blockquote the fragmentation does not describe',
    async ({ page, root }) => {
      const block = await readBlock(
        root,
        await blockPathByText(root, 'A table shorter')
      );
      const last = block.runs.at(-1)!;

      await page.mouse.click(last.right - 1, (last.top + last.bottom) / 2);
      await page.keyboard.press('Enter');
      await page.keyboard.type('> quoted');

      await expect(root.locator('blockquote')).toHaveText('quoted');
      await expect(page.getByTestId('pagination-page-count')).toHaveText(
        '0 pages'
      );
      await page.keyboard.type(' text');
      await expect(root.locator('blockquote')).toHaveText('quoted text');
      expect(
        await root.evaluate((host) => ({
          pages: document.querySelectorAll('[data-editor-page]').length,
          placed: host.querySelectorAll('[data-editor-placed]').length,
          runs: host.querySelectorAll('[data-pagination-line]').length,
        }))
      ).toEqual({ pages: 0, placed: 0, runs: 0 });
    }
  );

  demoTest(
    'projected text follows the dark theme color',
    async ({ page, root }) => {
      const readColors = () =>
        root.evaluate((host) => ({
          host: getComputedStyle(host).color,
          runs: [
            ...new Set(
              [
                ...host.querySelectorAll<HTMLElement>(
                  '[data-pagination-line] [data-editor-string]'
                ),
              ]
                .filter((string) => !string.closest('a, code, mark'))
                .map((string) => getComputedStyle(string).color)
            ),
          ],
        }));
      const light = await readColors();

      await page.evaluate(() => document.documentElement.classList.add('dark'));
      const dark = await readColors();

      expect(dark.host).not.toBe(light.host);
      expect(dark.runs).toEqual([dark.host]);
    }
  );

  demoTest(
    'keeps a comment reply editor unpaged and returns focus through the discussion slot',
    async ({ page, root }) => {
      await root
        .getByRole('button', { name: 'Open 1 discussion item for this block' })
        .click();
      const reply = page.getByRole('textbox', { name: 'Reply to thread' });

      await expect(reply).toBeVisible();
      await reply.click();
      await page.keyboard.type('Looks right');
      await expect(reply).toContainText('Looks right');
      expect(
        await reply.evaluate((editor) => ({
          insidePaged: Boolean(editor.closest('[data-editor-paged-editable]')),
          runs: editor.querySelectorAll('[data-pagination-line]').length,
        }))
      ).toEqual({ insidePaged: false, runs: 0 });

      await page.keyboard.press('Escape');
      await expect(page.locator('[data-discussion-popover]')).toBeHidden();
      await expect(root).toBeFocused();
    }
  );
});
