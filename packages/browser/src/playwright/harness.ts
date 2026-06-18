import type { Locator, Page } from '@playwright/test';
import { SLATE_BROWSER_HANDLE_KEY } from './constants';
import { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
import { getEditable, locateBlock, locateText } from './dom-locators';
import { getRenderedBlockDOMShapes } from './dom-shape';
import { getBlockTexts, getSelectedText } from './dom-text';
import {
  clickTextOffset,
  clickTextPathRange,
  collapseDOMAtTextPath,
  waitForPendingNativeTextInputRepair,
} from './dom-text-actions';
import { evaluateSlateBrowserHandle } from './handle';
import { createEditorHarnessAssertions } from './harness-assertions';
import {
  createEditorHarnessClipboard,
  createEditorHarnessIme,
} from './harness-input';
import { createEditorHarnessScenario } from './harness-scenario';
import {
  dispatchSyntheticKey,
  parsePlainSyntheticKey,
  parseSyntheticShortcut,
} from './keyboard';
import { waitForTextPathMaterialized } from './materialization';
import { waitForReady } from './ready';
import {
  hasDOMSelectionInRoot,
  hasUsableKeyboardFocus,
  supportsRootScopedSelection,
} from './root-focus';
import {
  doubleClickDragTextRange,
  dragTextRange,
  setDOMSelection,
  setSelection,
} from './selection-actions';
import {
  captureSelectionBookmark,
  handleSelectionMatches,
  resolveSelectionBookmark,
  restoreSelectionBookmark,
  unrefSelectionBookmark,
  waitForHandleSelection,
} from './selection-bookmarks';
import { getFocusOwnerSnapshot, getSelectionRect } from './selection-geometry';
import {
  focusWithHandle,
  selectAllWithHandle,
  setSelectionWithHandle,
  waitForHandleFocus,
  waitForSelectionHandle,
  waitForSelectionIfPresent,
  waitForSelectionRange,
} from './selection-handle';
import {
  takeDOMSelectionLocationSnapshotForRoot,
  takeDOMSelectionSnapshotForRoot,
  takeSelectionSnapshotForRoot,
  waitForSelectionSync,
} from './selection-snapshots';
import type { SurfaceTarget } from './surface';
import type {
  EditorSurfaceOptions,
  ReadyOptions,
  SelectionBookmark,
  SelectionCaptureOptions,
  SelectionPoint,
  SelectionSnapshot,
  SlateBrowserDoubleClickDragTextRangeOptions,
  SlateBrowserDragTextRangeOptions,
  SlateBrowserEditorHarness,
  SlateBrowserKernelTraceEntry,
} from './types';

export const createEditorHarness = (
  page: Page,
  name: string,
  surface: SurfaceTarget,
  surfaceOptions: EditorSurfaceOptions = {},
  explicitRoot?: Locator
): SlateBrowserEditorHarness => {
  const root = explicitRoot ?? getEditable(surface, surfaceOptions);
  const activateNestedContentRootForDOMSelection = async () => {
    const isNestedContentRoot = await root
      .evaluate((element: HTMLElement) =>
        Boolean(element.closest('[data-slate-content-root-slot]'))
      )
      .catch(() => false);

    if (!isNestedContentRoot) {
      return;
    }

    const box = await root.boundingBox();

    if (!box || box.width <= 0 || box.height <= 0) {
      return;
    }

    await root
      .click({
        position: {
          x: Math.min(8, Math.max(1, box.width - 1)),
          y: Math.min(8, Math.max(1, box.height - 1)),
        },
      })
      .catch(() =>
        root.evaluate((element: HTMLElement) => {
          element.focus({ preventScroll: true });
        })
      );
    await page.waitForTimeout(0);
  };

  const harness: SlateBrowserEditorHarness = {
    name,
    page,
    root,
    rootAt: (selector: string) =>
      createEditorHarness(
        page,
        name,
        surface,
        surfaceOptions,
        surface.locator(selector).first()
      ),
    get: {
      modelText: async () =>
        evaluateSlateBrowserHandle<string>(root, 'getText'),
      modelBlockText: async (index) =>
        evaluateSlateBrowserHandle<string | null>(
          root,
          'getBlockText',
          [index],
          'This editor surface does not expose getBlockText'
        ),
      modelBlockTexts: async () =>
        evaluateSlateBrowserHandle<string[]>(
          root,
          'getBlockTexts',
          [],
          'This editor surface does not expose getBlockTexts'
        ),
      text: async () => (await root.textContent()) ?? '',
      blockTexts: async () => getBlockTexts(root),
      renderedDOMShape: async () => getRenderedBlockDOMShapes(root),
      selectedText: async () => getSelectedText(root),
      displayedSelection: async () =>
        takeDisplayedSelectionSnapshotForRoot(root),
      html: async () => root.evaluate((el: HTMLElement) => el.innerHTML),
      selection: async () => takeSelectionSnapshotForRoot(root),
      domSelection: async () => takeDOMSelectionSnapshotForRoot(root),
      focusOwner: async () => getFocusOwnerSnapshot(root),
      kernelTrace: async () =>
        root.evaluate(
          (element: HTMLElement, { key }: { key: string }) => {
            const handle = (element as Record<string, any>)[key];

            return handle?.getKernelTrace ? handle.getKernelTrace() : [];
          },
          { key: SLATE_BROWSER_HANDLE_KEY }
        ) as Promise<SlateBrowserKernelTraceEntry[]>,
      history: async () =>
        root.evaluate(
          (element: HTMLElement, { key }: { key: string }) => {
            const handle = (element as Record<string, any>)[key];

            return handle?.getHistory ? handle.getHistory() : null;
          },
          { key: SLATE_BROWSER_HANDLE_KEY }
        ),
      lastCommit: async () =>
        root.evaluate(
          (element: HTMLElement, { key }: { key: string }) => {
            const handle = (element as Record<string, any>)[key];

            return handle?.getLastCommit ? handle.getLastCommit() : null;
          },
          { key: SLATE_BROWSER_HANDLE_KEY }
        ),
      placeholderShape: async (selector = '[data-slate-zero-width]') => {
        const count = await root.locator(selector).count();

        if (count === 0) {
          return null;
        }

        return root
          .locator(selector)
          .first()
          .evaluate((element: Element) => ({
            hasBr: !!element.querySelector('br'),
            hasFEFF: element.textContent?.includes('\uFEFF') ?? false,
            kind: element.getAttribute('data-slate-zero-width'),
          }));
      },
    },
    selection: {
      select: async (selection: SelectionSnapshot) => {
        const selectedWithHandle =
          (await waitForSelectionHandle(root)) &&
          (await setSelectionWithHandle(root, selection));

        if (!selectedWithHandle) {
          await setSelection(root, selection);
          await root.evaluate((element: HTMLElement) => {
            const rootNode = element.getRootNode() as Document | ShadowRoot;

            element.ownerDocument.dispatchEvent(
              new Event('selectionchange', { bubbles: true })
            );

            if (rootNode instanceof ShadowRoot) {
              rootNode.dispatchEvent(
                new Event('selectionchange', { bubbles: true })
              );
            }
          });
        }

        if (selectedWithHandle) {
          await waitForHandleSelection(root, selection);

          if (await supportsRootScopedSelection(root)) {
            try {
              await setDOMSelection(root, selection);
              await root.evaluate((element: HTMLElement) => {
                const rootNode = element.getRootNode() as Document | ShadowRoot;

                element.ownerDocument.dispatchEvent(
                  new Event('selectionchange', { bubbles: true })
                );

                if (rootNode instanceof ShadowRoot) {
                  rootNode.dispatchEvent(
                    new Event('selectionchange', { bubbles: true })
                  );
                }
              });
            } catch {
              // Some semantic selections intentionally do not resolve to a DOM
              // range, for example shell-backed rendering-strategy rows.
            }

            await waitForSelectionIfPresent(root);
          }
        } else {
          await waitForSelectionRange(root);
        }
        await harness.assert.selection(selection);
      },
      selectDOM: async (selection: SelectionSnapshot) => {
        await page.waitForTimeout(0);
        await activateNestedContentRootForDOMSelection();
        if (!(await setDOMSelection(root, selection))) {
          throw new Error(
            `Missing DOM text node for ${selection.anchor.path.join('.')} or ${selection.focus.path.join('.')}`
          );
        }
        await root.evaluate((element: HTMLElement) => {
          const rootNode = element.getRootNode() as Document | ShadowRoot;

          element.ownerDocument.dispatchEvent(
            new Event('selectionchange', { bubbles: true })
          );

          if (rootNode instanceof ShadowRoot) {
            rootNode.dispatchEvent(
              new Event('selectionchange', { bubbles: true })
            );
          }
        });
        await waitForSelectionRange(root);
        if (await waitForSelectionHandle(root)) {
          await root.evaluate(
            (element: HTMLElement, { key }: { key: string }) => {
              const handle = (element as Record<string, any>)[key];

              if (!handle?.importDOMSelection) {
                return;
              }

              handle.importDOMSelection();
            },
            { key: SLATE_BROWSER_HANDLE_KEY }
          );
          await page.waitForTimeout(0);
          await root.evaluate(
            (element: HTMLElement, { key }: { key: string }) => {
              const handle = (element as Record<string, any>)[key];

              if (!handle?.importDOMSelection) {
                return;
              }

              handle.importDOMSelection();
            },
            { key: SLATE_BROWSER_HANDLE_KEY }
          );
          if (!(await handleSelectionMatches(root, selection))) {
            await setSelectionWithHandle(root, selection);
            await page.waitForTimeout(0);
            if (!(await setDOMSelection(root, selection))) {
              throw new Error(
                `Missing DOM text node for ${selection.anchor.path.join('.')} or ${selection.focus.path.join('.')}`
              );
            }
            await root.evaluate(
              (element: HTMLElement, { key }: { key: string }) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.importDOMSelection) {
                  return;
                }

                handle.importDOMSelection();
              },
              { key: SLATE_BROWSER_HANDLE_KEY }
            );
          }
          await waitForHandleSelection(root, selection);
        }
      },
      dragTextRange: async (options: SlateBrowserDragTextRangeOptions) => {
        await dragTextRange(root, options);
      },
      doubleClickDragTextRange: async (
        options: SlateBrowserDoubleClickDragTextRangeOptions
      ) => {
        await doubleClickDragTextRange(root, options);
      },
      collapse: async (point: SelectionPoint) => {
        await harness.selection.select({
          anchor: point,
          focus: point,
        });
      },
      capture: async (options?: SelectionCaptureOptions) =>
        captureSelectionBookmark(root, options),
      bookmark: async (options?: SelectionCaptureOptions) =>
        captureSelectionBookmark(root, options),
      resolve: async (bookmark: SelectionBookmark) =>
        resolveSelectionBookmark(root, bookmark),
      restore: async (bookmark: SelectionBookmark) => {
        await restoreSelectionBookmark(root, bookmark);
        await waitForSelectionIfPresent(root);
      },
      unref: async (bookmark: SelectionBookmark) =>
        unrefSelectionBookmark(root, bookmark),
      selectAll: async () => {
        const selectedWithHandle =
          (await waitForSelectionHandle(root)) &&
          (await selectAllWithHandle(root));
        const expectedSelection = selectedWithHandle
          ? await takeSelectionSnapshotForRoot(root)
          : null;

        if (!selectedWithHandle) {
          await harness.focus();
          await page.keyboard.press('ControlOrMeta+A');
        }

        await waitForSelectionSync(root, expectedSelection ?? undefined);
      },
      get: async () => takeSelectionSnapshotForRoot(root),
      displayed: async () => takeDisplayedSelectionSnapshotForRoot(root),
      dom: async () => takeDOMSelectionSnapshotForRoot(root),
      location: async () => takeDOMSelectionLocationSnapshotForRoot(root),
      importDOM: async () =>
        evaluateSlateBrowserHandle(
          root,
          'importDOMSelection',
          [],
          'This editor surface does not expose importDOMSelection'
        ),
      rect: async () => getSelectionRect(root),
    },
    dom: {
      clickTextOffset: async ({
        clickCount,
        offset,
        path,
        waitForSelectionSync,
      }) => {
        await clickTextOffset(root, path, offset, {
          clickCount,
          waitForSelectionSync,
        });
      },
      clickTextRange: async (options) => {
        await clickTextPathRange(root, options);
      },
      collapseAtTextPath: async (point, options) => {
        await collapseDOMAtTextPath(root, point, options);
      },
      waitForPendingNativeTextInputRepair: async (options) => {
        await waitForPendingNativeTextInputRepair(root, options);
      },
      waitForTextPath: async (path, options) => {
        await waitForTextPathMaterialized(root, path, options);
      },
    },
    locator: {
      block: (path: number[]) => locateBlock(root, path),
      text: (path: number[]) => locateText(root, path),
    },
    ready: async (options: ReadyOptions) => {
      await waitForReady(harness, surface, options);
    },
    snapshot: async () => ({
      text: await harness.get.text(),
      blockTexts: await harness.get.blockTexts(),
      renderedBlocks: await harness.get.renderedDOMShape(),
      selectedText: await harness.get.selectedText(),
      selection: await harness.get.selection(),
      domSelection: await harness.get.domSelection(),
      focusOwner: await harness.get.focusOwner(),
      kernelTrace: await harness.get.kernelTrace(),
      history: await harness.get.history(),
      lastCommit: await harness.get.lastCommit(),
      placeholderShape: await harness.get.placeholderShape(),
    }),
    focus: async () => {
      const readHandleSelection = () =>
        root.evaluate(
          (element: HTMLElement, { key }: { key: string }) => {
            const handle = (element as Record<string, any>)[key];
            return handle?.getSelection ? handle.getSelection() : null;
          },
          { key: SLATE_BROWSER_HANDLE_KEY }
        );

      const focusedWithHandle =
        (await waitForSelectionHandle(root)) && (await focusWithHandle(root));

      if (focusedWithHandle) {
        await waitForHandleFocus(root);

        if (await hasDOMSelectionInRoot(root)) {
          await waitForSelectionSync(root);
        }

        return;
      }

      const selectionBeforeFocus = await readHandleSelection();

      await root.evaluate((element: HTMLElement) => {
        element.focus();
      });
      await root.page().waitForTimeout(50);
      const selection = (await readHandleSelection()) ?? selectionBeforeFocus;

      if (selection) {
        await harness.selection.select(selection);
        return;
      }

      await waitForSelectionRange(root);
    },
    click: async () => {
      await root.click();
    },
    type: async (text: string) => {
      if (
        !(await hasDOMSelectionInRoot(root)) ||
        !(await hasUsableKeyboardFocus(root))
      ) {
        await harness.focus();
      }
      await page.keyboard.type(text);
    },
    press: async (key: string) => {
      if (
        !(await hasDOMSelectionInRoot(root)) ||
        !(await hasUsableKeyboardFocus(root))
      ) {
        await harness.focus();
      }

      const syntheticShortcut = parseSyntheticShortcut(key);
      const shouldUseSemanticKeyTransport =
        !syntheticShortcut &&
        !(await hasDOMSelectionInRoot(root)) &&
        (await waitForSelectionHandle(root));
      const semanticKey = shouldUseSemanticKeyTransport
        ? parsePlainSyntheticKey(key)
        : null;

      if (syntheticShortcut) {
        await dispatchSyntheticKey(root, syntheticShortcut);
        return;
      }

      if (semanticKey) {
        await dispatchSyntheticKey(root, semanticKey);
        return;
      }

      await page.keyboard.press(key);
    },
    insertText: async (text: string) => {
      await evaluateSlateBrowserHandle<void>(root, 'insertText', [text]);
    },
    insertBreak: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'insertBreak');
    },
    deleteFragment: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'deleteFragment');
    },
    deleteBackward: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'deleteBackward');
    },
    deleteForward: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'deleteForward');
    },
    undo: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'undo');
    },
    redo: async () => {
      await evaluateSlateBrowserHandle<void>(root, 'redo');
    },
    selectAll: async () => {
      await harness.selection.selectAll();
    },
    assert: createEditorHarnessAssertions({
      getHarness: () => harness,
      root,
    }),
    clipboard: createEditorHarnessClipboard({
      getHarness: () => harness,
      page,
      root,
      surface,
    }),
    ime: createEditorHarnessIme({
      page,
      surface,
    }),
    trace: {
      snapshot: async (label, stepIndex = null) => ({
        label,
        snapshot: await harness.snapshot(),
        stepIndex,
      }),
    },
    scenario: createEditorHarnessScenario({
      getHarness: () => harness,
      page,
      root,
      surface,
    }),
    withExtension: <T>(extend: (editor: SlateBrowserEditorHarness) => T) =>
      extend(harness),
  };

  return harness;
};
