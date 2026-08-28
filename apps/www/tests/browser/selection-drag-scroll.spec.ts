import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';
import { expect, test } from '@playwright/test';

const CASE_ID = 'keeps native selection drag scrolling outside the editor';
const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';

type SelectionSnapshot = {
  anchorOffset: number;
  focusOffset: number;
  focusText: null | string;
  textLength: number;
};

type ScrollSample = {
  anchorTop: number;
  selectionLength: number;
  scrollTop: number;
};

const readNativeSelection = async (
  page: Parameters<typeof recordPliteBrowserRuntimeErrors>[0]
) =>
  page.evaluate((): SelectionSnapshot => {
    const selection = window.getSelection();

    return {
      anchorOffset: selection?.anchorOffset ?? -1,
      focusOffset: selection?.focusOffset ?? -1,
      focusText: selection?.focusNode?.textContent ?? null,
      textLength: selection?.toString().length ?? 0,
    };
  });

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.setViewportSize({ height: 1026, width: 1540 });
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('body').waitFor();

    await page.evaluate(() => {
      const control = document.createElement('div');

      control.dataset.nativeAutoscrollControl = 'true';
      Object.assign(control.style, {
        background: 'white',
        height: '300px',
        left: '20px',
        overflowY: 'auto',
        position: 'fixed',
        top: '20px',
        width: '400px',
        zIndex: '2147483647',
      });

      const editable = document.createElement('div');

      editable.contentEditable = 'true';
      editable.innerHTML = Array.from(
        { length: 80 },
        (_, index) => `<p>Native autoscroll control line ${index}</p>`
      ).join('');
      control.append(editable);
      document.body.append(control);
    });

    const nativeControl = page.locator('[data-native-autoscroll-control]');
    const nativeControlFirstLine = nativeControl.locator('p').first();
    const nativeControlBox = await nativeControl.boundingBox();
    const nativeControlFirstLineBox =
      await nativeControlFirstLine.boundingBox();

    expect(nativeControlBox).not.toBeNull();
    expect(nativeControlFirstLineBox).not.toBeNull();

    await page.mouse.move(
      nativeControlFirstLineBox!.x + 40,
      nativeControlFirstLineBox!.y + nativeControlFirstLineBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      nativeControlFirstLineBox!.x + 40,
      nativeControlBox!.y + nativeControlBox!.height + 100,
      { steps: 20 }
    );
    await expect
      .poll(() => nativeControl.evaluate((element) => element.scrollTop), {
        timeout: 4000,
      })
      .toBeGreaterThan(100);
    await page.mouse.up();
    await nativeControl.evaluate((element) => element.remove());

    const editorRoot = page.locator(EDITOR_ROOT).first();
    const editor = createPliteBrowserEditorHarness(page, CASE_ID, editorRoot);

    await editor.ready({
      editor: 'visible',
      text: 'Welcome to the Plate Playground!',
    });

    const heading = editorRoot
      .locator('[data-plite-string="true"]')
      .filter({ hasText: 'Welcome to the Plate Playground!' })
      .first();
    const scroller = editorRoot.locator(
      'xpath=ancestor::div[contains(@class, "overflow-y-auto")][1]'
    );

    await expect(heading).toBeVisible();
    await expect(scroller).toBeVisible();
    await scroller.evaluate((element) => element.scrollTo({ top: 0 }));

    await page.evaluate(
      ({ editorSelector, headingText }) => {
        const editorElement =
          document.querySelector<HTMLElement>(editorSelector);
        const headingElement = Array.from(
          editorElement?.querySelectorAll<HTMLElement>(
            '[data-plite-string="true"]'
          ) ?? []
        ).find((element) => element.textContent?.includes(headingText));
        const scrollerElement =
          editorElement?.closest<HTMLElement>('.overflow-y-auto');
        const pointerTrace: Array<{
          buttons: number;
          target: string;
          type: string;
        }> = [];
        const scrollTrace: ScrollSample[] = [];
        const recordPointer = (event: Event) => {
          const mouseEvent = event as MouseEvent;
          const target = event.target as HTMLElement | null;

          pointerTrace.push({
            buttons: mouseEvent.buttons,
            target:
              target?.closest('[data-plite-editor="true"]') === null
                ? (target?.tagName ?? 'none')
                : 'editor',
            type: event.type,
          });
        };
        const recordScroll = () => {
          if (!headingElement || !scrollerElement) return;

          scrollTrace.push({
            anchorTop: headingElement.getBoundingClientRect().top,
            selectionLength: window.getSelection()?.toString().length ?? 0,
            scrollTop: scrollerElement.scrollTop,
          });
        };

        for (const type of ['mousedown', 'mousemove', 'mouseup', 'pointerup']) {
          document.addEventListener(type, recordPointer, { capture: true });
        }
        document.addEventListener('selectionchange', recordScroll);
        scrollerElement?.addEventListener('scroll', recordScroll, {
          passive: true,
        });
        recordScroll();

        Object.assign(window, {
          __issue5113PointerTrace: pointerTrace,
          __issue5113ScrollTrace: scrollTrace,
        });
      },
      {
        editorSelector: EDITOR_ROOT,
        headingText: 'Rich Content Editing',
      }
    );

    const headingBox = await heading.boundingBox();
    const scrollerBox = await scroller.boundingBox();
    const viewport = page.viewportSize();

    expect(headingBox).not.toBeNull();
    expect(scrollerBox).not.toBeNull();
    expect(viewport).not.toBeNull();

    const x = headingBox!.x + Math.min(140, headingBox!.width / 2);
    const startY = headingBox!.y + headingBox!.height / 2;
    const lowerBoundaryY = Math.min(
      scrollerBox!.y + scrollerBox!.height - 2,
      viewport!.height - 2
    );
    const belowBrowserY = viewport!.height + 20;
    const insideY = Math.min(scrollerBox!.y + 200, viewport!.height - 40);

    await page.mouse.move(x, startY);
    await page.mouse.down();

    try {
      await page.mouse.move(x, lowerBoundaryY, { steps: 20 });
      await page.mouse.move(x, belowBrowserY);

      await expect
        .poll(() => scroller.evaluate((element) => element.scrollTop), {
          timeout: 4000,
        })
        .toBeGreaterThan(180);
      await page.mouse.move(x, insideY, { steps: 10 });

      const downwardNative = await readNativeSelection(page);
      const downwardModel = await editor.get.selection();
      const downwardScrollTrace = await page.evaluate(
        () =>
          (
            window as typeof window & {
              __issue5113ScrollTrace?: ScrollSample[];
            }
          ).__issue5113ScrollTrace ?? []
      );
      const downwardTrace = await page.evaluate(
        () =>
          (
            window as typeof window & {
              __issue5113PointerTrace?: Array<{
                buttons: number;
                target: string;
                type: string;
              }>;
            }
          ).__issue5113PointerTrace ?? []
      );

      expect(
        downwardTrace.some(
          (entry) => entry.type === 'mousemove' && entry.buttons === 1
        )
      ).toBe(true);
      expect(
        downwardTrace.some(
          (entry) => entry.type === 'mouseup' || entry.type === 'pointerup'
        )
      ).toBe(false);
      expect(downwardNative.textLength).toBeGreaterThan(300);
      expect(downwardModel).not.toBeNull();
      const positiveSamples = downwardScrollTrace.filter(
        (sample, index, samples) =>
          index > 0 && sample.scrollTop > samples[index - 1]!.scrollTop
      );

      expect(positiveSamples.length).toBeGreaterThan(0);
      expect(positiveSamples.at(-1)!.anchorTop).toBeLessThan(
        positiveSamples[0]!.anchorTop
      );
      await expect(page.getByRole('button', { name: 'Ask AI' })).toHaveCount(0);
    } finally {
      await page.mouse.up();
      await page.mouse.move(x, insideY);
    }

    const downwardReleaseTrace = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __issue5113PointerTrace?: Array<{
              buttons: number;
              target: string;
              type: string;
            }>;
          }
        ).__issue5113PointerTrace ?? []
    );

    expect(
      downwardReleaseTrace.some(
        (entry) => entry.type === 'mouseup' || entry.type === 'pointerup'
      ) ||
        downwardReleaseTrace.some(
          (entry) => entry.type === 'mousemove' && entry.buttons === 0
        )
    ).toBe(true);

    await scroller.evaluate((element) => {
      element.scrollTo({ top: 800 });
      const rect = element.getBoundingClientRect();

      window.scrollBy(0, rect.top);
    });
    await expect
      .poll(() => scroller.evaluate((element) => element.scrollTop))
      .toBe(800);
    await page.evaluate(() => {
      const trace = (
        window as typeof window & {
          __issue5113ScrollTrace?: ScrollSample[];
        }
      ).__issue5113ScrollTrace;

      trace?.splice(0);
    });

    const upwardHeading = editorRoot
      .locator('[data-plite-string="true"]')
      .filter({ hasText: 'How Plate Compares' })
      .first();

    await expect(upwardHeading).toBeVisible();
    const upwardHeadingBox = await upwardHeading.boundingBox();

    expect(upwardHeadingBox).not.toBeNull();
    const upwardStart = {
      x: upwardHeadingBox!.x + Math.min(80, upwardHeadingBox!.width / 2),
      y: upwardHeadingBox!.y + upwardHeadingBox!.height / 2,
    };

    await page.mouse.click(upwardStart.x, upwardStart.y);

    const upwardStartScrollTop = await scroller.evaluate(
      (element) => element.scrollTop
    );
    const upwardStartModel = await editor.get.selection();
    const upwardPointerTraceStart = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __issue5113PointerTrace?: Array<{
              buttons: number;
              target: string;
              type: string;
            }>;
          }
        ).__issue5113PointerTrace?.length ?? 0
    );

    await page.mouse.move(upwardStart.x, upwardStart.y);
    await page.mouse.down();

    try {
      await page.mouse.move(upwardStart.x, 1, { steps: 30 });
      await expect(page.getByRole('button', { name: 'Ask AI' })).toHaveCount(0);

      await expect
        .poll(() => scroller.evaluate((element) => element.scrollTop), {
          timeout: 4000,
        })
        .toBeLessThan(upwardStartScrollTop - 80);
      await expect
        .poll(
          async () => {
            const selection = await readNativeSelection(page);

            return selection.textLength;
          },
          { timeout: 1000 }
        )
        .toBeGreaterThan(100);
      const upwardNative = await readNativeSelection(page);
      await expect
        .poll(() => editor.get.selection(), { timeout: 1000 })
        .not.toEqual(upwardStartModel);

      const upwardModel = await editor.get.selection();
      const traces = await page.evaluate(() => ({
        pointer:
          (
            window as typeof window & {
              __issue5113PointerTrace?: Array<{
                buttons: number;
                target: string;
                type: string;
              }>;
            }
          ).__issue5113PointerTrace ?? [],
        scroll:
          (
            window as typeof window & {
              __issue5113ScrollTrace?: ScrollSample[];
            }
          ).__issue5113ScrollTrace ?? [],
      }));
      const upwardPointerTrace = traces.pointer.slice(upwardPointerTraceStart);
      const negativeSamples = traces.scroll.filter(
        (sample, index, samples) =>
          index > 0 && sample.scrollTop < samples[index - 1]!.scrollTop
      );

      expect(negativeSamples.length).toBeGreaterThan(0);
      expect(negativeSamples.at(-1)!.anchorTop).toBeGreaterThan(
        negativeSamples[0]!.anchorTop
      );
      expect(upwardNative.textLength).toBeGreaterThan(100);
      expect(upwardModel).not.toBeNull();
      expect(
        upwardPointerTrace.some(
          (entry) => entry.type === 'mousemove' && entry.buttons === 1
        )
      ).toBe(true);
      expect(
        upwardPointerTrace.some(
          (entry) => entry.type === 'mouseup' || entry.type === 'pointerup'
        )
      ).toBe(false);
      await expect(editorRoot).toBeFocused();
    } finally {
      await page.mouse.up();
      await page.mouse.move(x, insideY);
    }

    const finalPointerTrace = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __issue5113PointerTrace?: Array<{
              buttons: number;
              target: string;
              type: string;
            }>;
          }
        ).__issue5113PointerTrace ?? []
    );

    const upwardReleaseTrace = finalPointerTrace.slice(upwardPointerTraceStart);

    expect(
      upwardReleaseTrace.some(
        (entry) => entry.type === 'mouseup' || entry.type === 'pointerup'
      ) ||
        upwardReleaseTrace.some(
          (entry) => entry.type === 'mousemove' && entry.buttons === 0
        )
    ).toBe(true);

    const releasedScrollTop = await scroller.evaluate(
      (element) => element.scrollTop
    );

    await page.waitForTimeout(100);
    await expect
      .poll(() => scroller.evaluate((element) => element.scrollTop))
      .toBe(releasedScrollTop);

    await heading.click();
    await expect(page.getByRole('button', { name: 'Ask AI' })).toHaveCount(0);
    await editorRoot.press('ArrowRight');
    await expect(editorRoot).toBeFocused();
    expect(await editor.get.selection()).not.toBeNull();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
