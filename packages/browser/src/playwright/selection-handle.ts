import { expect, type Locator } from '@playwright/test';

import { SLATE_BROWSER_HANDLE_KEY } from './constants';
import { waitForSelectionSync } from './selection-snapshots';
import type { SelectionSnapshot } from './types';

export const hasSelectionHandle = async (root: Locator) =>
  root
    .evaluate(
      (element: HTMLElement, { key }: { key: string }) =>
        !!(element as Record<string, any>)[key]?.selectRange,
      { key: SLATE_BROWSER_HANDLE_KEY }
    )
    .catch(() => false);

export const waitForSelectionHandle = async (root: Locator, timeout = 2000) => {
  try {
    await root.waitFor();
    await expect.poll(() => hasSelectionHandle(root), { timeout }).toBe(true);
    return true;
  } catch {
    return false;
  }
};

export const waitForHandleFocus = async (root: Locator, timeout = 2000) => {
  await expect
    .poll(
      () =>
        root.evaluate(
          (element: HTMLElement, { key }: { key: string }) => {
            const handle = (element as Record<string, any>)[key];
            const rootNode = element.getRootNode() as Document | ShadowRoot;
            const activeElement =
              'activeElement' in rootNode
                ? rootNode.activeElement
                : element.ownerDocument.activeElement;

            const hasFocus =
              activeElement === element ||
              (!!activeElement && element.contains(activeElement));

            return hasFocus && !!handle?.getSelection?.();
          },
          { key: SLATE_BROWSER_HANDLE_KEY }
        ),
      { timeout }
    )
    .toBe(true);
};

export const waitForSelectionRange = async (root: Locator) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement) => {
        const rootNode = element.getRootNode() as Document | ShadowRoot;
        const rootSelection =
          'getSelection' in rootNode
            ? rootNode.getSelection()
            : element.ownerDocument.getSelection();
        const documentSelection = element.ownerDocument.getSelection();

        return (
          (rootSelection?.rangeCount ?? 0) > 0 ||
          (documentSelection?.rangeCount ?? 0) > 0
        );
      })
    )
    .toBe(true);
  await root.page().waitForTimeout(100);
};

export const waitForSelectionIfPresent = async (root: Locator) => {
  const hasSelection = await root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0 ||
      !selection.anchorNode ||
      !selection.focusNode
    ) {
      return false;
    }

    return (
      element.contains(selection.anchorNode) &&
      element.contains(selection.focusNode)
    );
  });

  if (!hasSelection) {
    return;
  }

  await waitForSelectionSync(root);
};

export const setSelectionWithHandle = async (
  root: Locator,
  selection: SelectionSnapshot
) =>
  root.evaluate(
    (
      element: HTMLElement,
      { key, nextSelection }: { key: string; nextSelection: SelectionSnapshot }
    ) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle?.selectRange) {
        return false;
      }

      handle.selectRange(nextSelection);
      return true;
    },
    {
      key: SLATE_BROWSER_HANDLE_KEY,
      nextSelection: selection,
    }
  );

export const selectAllWithHandle = async (root: Locator) =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle?.selectAll) {
        return false;
      }

      handle.selectAll();
      return true;
    },
    { key: SLATE_BROWSER_HANDLE_KEY }
  );

export const focusWithHandle = async (root: Locator) =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle?.focus) {
        return false;
      }

      handle.focus();
      return true;
    },
    { key: SLATE_BROWSER_HANDLE_KEY }
  );

export const hasExpandedSelection = (selection: SelectionSnapshot | null) =>
  !!selection &&
  (selection.anchor.offset !== selection.focus.offset ||
    selection.anchor.path.join(',') !== selection.focus.path.join(','));
