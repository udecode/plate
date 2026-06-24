import { expect, type Locator } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type {
  RangeRefAffinity,
  SelectionBookmark,
  SelectionCaptureOptions,
  SelectionSnapshot,
} from './types';

export const captureSelectionBookmark = async (
  root: Locator,
  options: SelectionCaptureOptions = {}
): Promise<SelectionBookmark> =>
  root.evaluate(
    (
      element: HTMLElement,
      { key, affinity }: { key: string; affinity: RangeRefAffinity | undefined }
    ) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      const selection = handle.getSelection();

      if (!selection) {
        throw new Error(
          'Cannot capture a bookmark without an editor selection'
        );
      }

      return {
        id: handle.createRangeRef(selection, affinity ?? 'inward'),
      };
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      affinity: options.affinity,
    }
  );

export const resolveSelectionBookmark = async (
  root: Locator,
  bookmark: SelectionBookmark
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      return handle.resolveRangeRef(id);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: bookmark.id,
    }
  );

export const restoreSelectionBookmark = async (
  root: Locator,
  bookmark: SelectionBookmark
) => {
  await root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      const range = handle.resolveRangeRef(id);

      if (!range) {
        throw new Error('Cannot restore a cleared bookmark');
      }

      handle.selectRange(range);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: bookmark.id,
    }
  );
};

export const unrefSelectionBookmark = async (
  root: Locator,
  bookmark: SelectionBookmark
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      return handle.unrefRangeRef(id);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: bookmark.id,
    }
  );

export const handleSelectionMatches = async (
  root: Locator,
  expected: SelectionSnapshot
): Promise<boolean> =>
  root.evaluate(
    (
      element: HTMLElement,
      { key, selection }: { key: string; selection: SelectionSnapshot }
    ) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        return false;
      }

      const current = handle.getSelection();

      if (!current) {
        return false;
      }

      const samePath = (left: number[], right: number[]) =>
        left.length === right.length &&
        left.every((segment, index) => segment === right[index]);

      return (
        samePath(current.anchor.path, selection.anchor.path) &&
        samePath(current.focus.path, selection.focus.path) &&
        current.anchor.offset === selection.anchor.offset &&
        current.focus.offset === selection.focus.offset
      );
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      selection: expected,
    }
  );

export const waitForHandleSelection = async (
  root: Locator,
  expected: SelectionSnapshot
) => {
  await expect
    .poll(async () => handleSelectionMatches(root, expected))
    .toBe(true);
};
