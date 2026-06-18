import { expect, type Locator } from '@playwright/test';

import type { SlateBrowserEditorHarness } from './types';

/** Snapshot used to prove caret visibility inside a scroll container. */
/** Caret visibility evidence captured inside a scrollable parent. */
export type CaretVisibilitySnapshot = {
  activeElementTestId: string | null;
  activeElementTagName: string | null;
  anchorInRoot: boolean;
  anchorNodeText: string | null;
  focusInRoot: boolean;
  hasSelection: boolean;
  parentRect: { bottom: number; top: number } | null;
  rangeCount: number;
  rootContainsActiveElement: boolean;
  scrollParentTagName: string | null;
  textHostText: string | null;
  visible: boolean;
  visibleRect: {
    bottom: number;
    height: number;
    top: number;
    width: number;
  } | null;
};

const takeCaretVisibilitySnapshot = async (
  root: Locator
): Promise<CaretVisibilitySnapshot> =>
  root.evaluate((element: HTMLElement) => {
    const selection = element.ownerDocument.getSelection();
    const activeElement = element.ownerDocument.activeElement;
    const anchorInRoot =
      !!selection?.anchorNode && element.contains(selection.anchorNode);
    const focusInRoot =
      !!selection?.focusNode && element.contains(selection.focusNode);
    const base = {
      activeElementTestId:
        (activeElement as HTMLElement | null)?.dataset?.testId ?? null,
      activeElementTagName: activeElement?.tagName?.toLowerCase() ?? null,
      anchorInRoot,
      anchorNodeText: selection?.anchorNode?.textContent ?? null,
      focusInRoot,
      hasSelection: !!selection,
      parentRect: null,
      rangeCount: selection?.rangeCount ?? 0,
      rootContainsActiveElement:
        !!activeElement && element.contains(activeElement),
      scrollParentTagName: null,
      textHostText: null,
      visible: false,
      visibleRect: null,
    } satisfies CaretVisibilitySnapshot;

    if (!selection || selection.rangeCount === 0) {
      return base;
    }

    const scrollParent = [
      element,
      ...Array.from(
        (function* parents() {
          for (
            let parent = element.parentElement;
            parent;
            parent = parent.parentElement
          ) {
            if (parent.scrollHeight > parent.clientHeight) {
              yield parent;
            }
          }
        })()
      ),
    ].find((parent) => parent.scrollHeight > parent.clientHeight);
    const scrollParentTagName = scrollParent?.tagName ?? null;
    const anchorElement =
      selection.anchorNode instanceof Element
        ? selection.anchorNode
        : selection.anchorNode instanceof Text
          ? selection.anchorNode.parentElement
          : null;
    const textHost = anchorElement?.closest('[data-slate-node="text"]');
    const range = selection.getRangeAt(0);
    const caretRect =
      Array.from(range.getClientRects())[0] ?? range.getBoundingClientRect();
    const visibleRect =
      caretRect.width === 0 && caretRect.height === 0
        ? textHost?.getBoundingClientRect()
        : caretRect;

    if (!visibleRect || (visibleRect.width === 0 && visibleRect.height === 0)) {
      return {
        ...base,
        scrollParentTagName,
        textHostText: textHost?.textContent ?? null,
      };
    }

    const parentRect = scrollParent?.getBoundingClientRect() ?? {
      bottom: window.innerHeight,
      top: 0,
    };
    const visible =
      anchorInRoot &&
      focusInRoot &&
      !!activeElement &&
      element.contains(activeElement) &&
      visibleRect.top >= parentRect.top - 1 &&
      visibleRect.bottom <= parentRect.bottom + 1;

    return {
      ...base,
      parentRect: {
        bottom: parentRect.bottom,
        top: parentRect.top,
      },
      scrollParentTagName,
      textHostText: textHost?.textContent ?? null,
      visible,
      visibleRect: {
        bottom: visibleRect.bottom,
        height: visibleRect.height,
        top: visibleRect.top,
        width: visibleRect.width,
      },
    };
  });

export const assertCaretVisibleInScrollableParent = async (root: Locator) => {
  let lastSnapshot: CaretVisibilitySnapshot | null = null;

  try {
    await expect
      .poll(async () => {
        lastSnapshot = await takeCaretVisibilitySnapshot(root);

        return lastSnapshot.visible;
      })
      .toBe(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `${message}\nLast caret visibility snapshot: ${JSON.stringify(
        lastSnapshot,
        null,
        2
      )}`
    );
  }
};

export const assertNoVisibleCaretInRoot = async (root: Locator) => {
  let lastSnapshot: CaretVisibilitySnapshot | null = null;

  try {
    await expect
      .poll(async () => {
        lastSnapshot = await takeCaretVisibilitySnapshot(root);

        return {
          rootContainsActiveElement: lastSnapshot.rootContainsActiveElement,
          visible: lastSnapshot.visible,
        };
      })
      .toEqual({
        rootContainsActiveElement: false,
        visible: false,
      });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `${message}\nLast caret visibility snapshot: ${JSON.stringify(
        lastSnapshot,
        null,
        2
      )}`
    );
  }
};

/** Assert the caret is visible inside its scrollable ancestor. */
export const assertSlateBrowserCaretVisibleInScrollableParent = async (
  editor: SlateBrowserEditorHarness
) => {
  await assertCaretVisibleInScrollableParent(editor.root);
};
