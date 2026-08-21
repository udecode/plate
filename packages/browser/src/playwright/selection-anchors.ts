import { expect, type Locator } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type {
  RangeAnchorAssociation,
  SelectionAnchorHandle,
  SelectionCaptureOptions,
  SelectionSnapshot,
} from './types';

export const captureSelectionAnchorHandle = async (
  root: Locator,
  options: SelectionCaptureOptions = {}
): Promise<SelectionAnchorHandle> =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        key,
        association,
      }: { key: string; association: RangeAnchorAssociation | undefined }
    ) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      const selection = handle.getSelection();

      if (!selection) {
        throw new Error('Cannot capture a anchor without an editor selection');
      }

      return {
        id: handle.createRangeAnchor(selection, association ?? 'inward'),
      };
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      association: options.association,
    }
  );

export const resolveSelectionAnchorHandle = async (
  root: Locator,
  anchor: SelectionAnchorHandle
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      return handle.resolveRangeAnchor(id);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: anchor.id,
    }
  );

export const restoreSelectionAnchorHandle = async (
  root: Locator,
  anchor: SelectionAnchorHandle
) => {
  await root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      const range = handle.resolveRangeAnchor(id);

      if (!range) {
        throw new Error('Cannot restore a cleared anchor');
      }

      handle.selectRange(range);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: anchor.id,
    }
  );
};

export const releaseSelectionAnchorHandle = async (
  root: Locator,
  anchor: SelectionAnchorHandle
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key, id }: { key: string; id: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle) {
        throw new Error(
          'This editor surface does not expose a Plite browser handle'
        );
      }

      return handle.releaseRangeAnchor(id);
    },
    {
      key: PLITE_BROWSER_HANDLE_KEY,
      id: anchor.id,
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
        current.kind === selection.kind &&
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
