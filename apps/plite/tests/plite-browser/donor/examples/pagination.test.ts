import { expect, test, type Page } from '@playwright/test';
import {
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';

type PaginationEditor = Awaited<ReturnType<typeof openExample>>;
type ModelElement = {
  children?: ModelElement[];
  text?: string;
  type?: string;
};

const openPagination = (
  page: Page,
  query: Record<string, number | string>
) =>
  openExample(page, 'plite/pagination', {
    query,
    ready: {
      editor: 'visible',
      text: /Premirror Milestone 1 test document/,
    },
  });

const getTopLevelPath = async (editor: PaginationEditor, type: string) => {
  const value = (await editor.get.modelValue()) as {
    children: ModelElement[];
  };
  const index = value.children.findIndex((node) => node.type === type);

  if (index < 0) throw new Error(`Missing top-level ${type} node.`);

  return index;
};

const getPageProof = (editor: PaginationEditor) =>
  editor.root.evaluate((root) => {
    const pagedSurface = root.closest('[data-editor-paged-editable]');
    const pages = Array.from(
      document.querySelectorAll<HTMLElement>('[data-editor-page]')
    );
    const meta = document.querySelector('.editor-pagination-meta')?.textContent;
    const totalPages = Number(meta?.match(/pages (\d+)/)?.[1] ?? 0);

    return {
      editableIdentity: Reflect.get(root, '__paginationHostIdentity') ?? null,
      pageIndexes: pages.map((page) =>
        Number(page.getAttribute('data-editor-page-index'))
      ),
      pageOwnsDocumentNodes: pages.some((page) =>
        Boolean(page.querySelector('[data-editor-node]'))
      ),
      pageWidths: pages.map((page) => Number.parseFloat(page.style.width)),
      pagedSurfaceCount: document.querySelectorAll(
        '[data-editor-paged-editable]'
      ).length,
      surfaceCount: document.querySelectorAll('[data-editor-page-surface]')
        .length,
      totalPages,
      virtualized:
        pagedSurface?.getAttribute(
          'data-editor-paged-editable-page-virtualization'
        ) === 'true',
    };
  });

const getTableProof = (editor: PaginationEditor, tablePath: number) =>
  editor.root.evaluate((root, path) => {
    const table = root.querySelector<HTMLElement>(
      `[data-editor-path="${path}"]`
    );
    const rows = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-testid="pagination-rich-table-row"]'
      )
    );
    const cells = root.querySelectorAll(
      '[data-testid="pagination-rich-table-cell"]'
    );
    const pathCounts = new Map<string, number>();

    root
      .querySelectorAll(`[data-editor-path="${path}"], [data-editor-path^="${path},"]`)
      .forEach((element) => {
        const editorPath = element.getAttribute('data-editor-path');

        if (editorPath) {
          pathCounts.set(editorPath, (pathCounts.get(editorPath) ?? 0) + 1);
        }
      });

    return {
      cellCount: cells.length,
      duplicatePaths: [...pathCounts]
        .filter(([, count]) => count > 1)
        .map(([editorPath]) => editorPath),
      fragmentPages: table
        ?.getAttribute('data-fragment-pages')
        ?.split(',')
        .filter(Boolean)
        .map(Number),
      rowCount: rows.length,
      rowLayouts: rows.map((row) => ({
        height: row.style.height,
        path: row.getAttribute('data-editor-path'),
        position: row.style.position,
        top: row.style.top,
      })),
      tableCount: root.querySelectorAll(
        '[data-testid="pagination-rich-table"]'
      ).length,
    };
  }, tablePath);

test.describe(
  'pagination example',
  {
    annotation: {
      description: 'serial',
      type: 'plite-browser-profile',
    },
  },
  () => {
    test.describe.configure({ mode: 'serial' });

    test('keeps page chrome separate and switches one editable host between complete and virtualized pages', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Chromium pagination ownership proof'
      );
      const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

      try {
        const editor = await openPagination(page, {
          page_layout: 'single',
          rendering: 'complete',
          rows: 240,
          stress_pages: 0,
        });

        await editor.root.evaluate((root) => {
          Reflect.set(root, '__paginationHostIdentity', 'retained');
        });
        await expect
          .poll(() => getPageProof(editor))
          .toMatchObject({
            editableIdentity: 'retained',
            pageOwnsDocumentNodes: false,
            pagedSurfaceCount: 1,
            virtualized: false,
          });
        const complete = await getPageProof(editor);

        expect(complete.totalPages).toBeGreaterThan(2);
        expect(complete.surfaceCount).toBe(complete.totalPages);
        expect(new Set(complete.pageIndexes).size).toBe(
          complete.pageIndexes.length
        );
        expect(complete.pageIndexes).toEqual(
          Array.from({ length: complete.totalPages }, (_, index) => index)
        );

        await page.getByLabel('Rendering').selectOption('virtualized');
        await expect
          .poll(() => getPageProof(editor))
          .toMatchObject({
            editableIdentity: 'retained',
            pageOwnsDocumentNodes: false,
            pagedSurfaceCount: 1,
            totalPages: complete.totalPages,
            virtualized: true,
          });
        const virtualized = await getPageProof(editor);

        expect(virtualized.surfaceCount).toBeGreaterThan(0);
        expect(virtualized.surfaceCount).toBeLessThan(virtualized.totalPages);
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('remeasures after editing and page-setting changes without losing the caret', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Chromium pagination reflow proof'
      );
      const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

      try {
        const editor = await openPagination(page, {
          page_layout: 'single',
          rendering: 'complete',
          rows: 8,
          stress_pages: 0,
        });
        const initial = await getPageProof(editor);
        const value = (await editor.get.modelValue()) as {
          children: Array<{ children: Array<{ text: string }> }>;
        };
        const initialText = value.children[0]!.children[0]!.text;
        const addition = ` pagination-growth${' measured-flow'.repeat(900)}`;

        expect(initial.pageWidths[0]).toBe(794);
        await editor.selection.collapse({ path: [0, 0], offset: initialText.length });
        await editor.focus();
        await page.keyboard.insertText(addition);

        await expect.poll(() => editor.get.modelText()).toContain(addition);
        await expect
          .poll(async () => (await getPageProof(editor)).totalPages)
          .toBeGreaterThan(initial.totalPages);
        await expect.poll(() => editor.selection.get()).toEqual({
          anchor: { offset: initialText.length + addition.length, path: [0, 0] },
          focus: { offset: initialText.length + addition.length, path: [0, 0] },
        });

        await page.getByLabel('Preset').selectOption('letter');
        await expect
          .poll(async () => (await getPageProof(editor)).pageWidths[0])
          .toBe(816);
        await expect.poll(() => editor.selection.get()).toEqual({
          anchor: { offset: initialText.length + addition.length, path: [0, 0] },
          focus: { offset: initialText.length + addition.length, path: [0, 0] },
        });
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('places direct table children once and copies across omitted rows from the model', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Chromium direct-child fragmentation and clipboard proof'
      );
      const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

      try {
        const editor = await openPagination(page, {
          page_layout: 'single',
          rendering: 'virtualized',
          rows: 240,
          stress_pages: 0,
        });
        const tablePath = await getTopLevelPath(editor, 'table');

        await editor.selection.collapse({
          path: [tablePath, 120, 1, 0],
          offset: 'Cell 121'.length,
        });
        await expect
          .poll(async () => {
            const proof = await getTableProof(editor, tablePath);

            return {
              bounded: proof.rowCount > 0 && proof.rowCount < 240,
              cellCount: proof.cellCount,
              duplicatePaths: proof.duplicatePaths,
              rowCount: proof.rowCount,
              selectedRowMounted: proof.rowLayouts.some(
                (row) => row.path === `${tablePath},120`
              ),
              tableCount: proof.tableCount,
              validLayouts: proof.rowLayouts.every(
                (row) =>
                  row.height === '36px' &&
                  row.position === 'absolute' &&
                  Number.isFinite(Number.parseFloat(row.top))
              ),
            };
          })
          .toMatchObject({
            bounded: true,
            duplicatePaths: [],
            selectedRowMounted: true,
            tableCount: 1,
            validLayouts: true,
          });
        const mounted = await getTableProof(editor, tablePath);

        expect(mounted.cellCount).toBe(mounted.rowCount * 3);

        await editor.selection.select({
          anchor: { path: [tablePath, 20, 0, 0], offset: 0 },
          focus: {
            path: [tablePath, 180, 2, 0],
            offset: 'Fragment 181'.length,
          },
        });
        await editor.focus();
        await editor.root.press('ControlOrMeta+C');
        const copiedText = await editor.clipboard.readText();

        expect(copiedText).toContain('Row 21');
        expect(copiedText).toContain('Fragment 181');
        expect((await getTableProof(editor, tablePath)).rowCount).toBeLessThan(
          240
        );
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });

    test('keeps oversized atomic content reachable and places following content after it', async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'chromium',
        'Chromium oversized atomic pagination proof'
      );
      const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });

      try {
        const editor = await openPagination(page, {
          media_height: 1200,
          page_layout: 'single',
          rendering: 'complete',
          rows: 8,
          stress_pages: 0,
        });
        const imagePath = await getTopLevelPath(editor, 'image');
        const value = (await editor.get.modelValue()) as {
          children: ModelElement[];
        };
        const finalPath = value.children.length - 1;

        await expect
          .poll(() =>
            editor.root.evaluate(
              (root, paths) => {
                const image = root.querySelector<HTMLElement>(
                  `[data-editor-path="${paths.image}"]`
                );
                const following = root.querySelector<HTMLElement>(
                  `[data-editor-path="${paths.following}"]`
                );
                const imageTop = Number.parseFloat(image?.style.top ?? 'NaN');
                const imageHeight = Number.parseFloat(
                  image?.style.height ?? 'NaN'
                );
                const followingTop = Number.parseFloat(
                  following?.style.top ?? 'NaN'
                );
                const mountItems = Array.from(
                  document.querySelectorAll<HTMLElement>(
                    '[data-editor-page-surface]'
                  )
                );
                const occupiedSurface = mountItems.find((surface) => {
                  const top = Number.parseFloat(surface.style.top);
                  const height = Number.parseFloat(surface.style.height);

                  return imageTop >= top && imageTop < top + height;
                });
                const page = occupiedSurface?.querySelector<HTMLElement>(
                  '[data-editor-page]'
                );

                return {
                  followingAfterImage:
                    Number.isFinite(followingTop) &&
                    followingTop >= imageTop + imageHeight,
                  imageHeight,
                  occupiedHeight: Number.parseFloat(
                    occupiedSurface?.style.height ?? 'NaN'
                  ),
                  pageHeight: Number.parseFloat(page?.style.height ?? 'NaN'),
                };
              },
              { following: finalPath, image: imagePath }
            )
          )
          .toMatchObject({
            followingAfterImage: true,
            imageHeight: 1200,
          });
        const overflow = await editor.root.evaluate(
          (root, path) => {
            const image = root.querySelector<HTMLElement>(
              `[data-editor-path="${path}"]`
            );

            image?.scrollIntoView({ block: 'center' });
            const viewport = document.querySelector<HTMLElement>(
              '[data-testid="pagination-viewport"]'
            );
            const imageRect = image?.getBoundingClientRect();
            const viewportRect = viewport?.getBoundingClientRect();

            return {
              reachable:
                !!imageRect &&
                !!viewportRect &&
                imageRect.bottom > viewportRect.top &&
                imageRect.top < viewportRect.bottom,
            };
          },
          imagePath
        );
        const geometry = await editor.root.evaluate(() => {
          const surfaces = Array.from(
            document.querySelectorAll<HTMLElement>(
              '[data-editor-page-surface]'
            )
          );

          return surfaces.some((surface) => {
            const page = surface.querySelector<HTMLElement>('[data-editor-page]');

            return (
              Number.parseFloat(surface.style.height) >
              Number.parseFloat(page?.style.height ?? 'NaN')
            );
          });
        });

        expect(overflow.reachable).toBe(true);
        expect(geometry).toBe(true);
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  }
);
