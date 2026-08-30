import type { Locator } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type { SelectionSnapshot } from './types';

type PliteBrowserHarnessHandle = {
  deleteBackward: () => void;
  deleteForward: () => void;
  deleteFragment: () => void;
  getBlockText: (index: number) => string | null;
  getBlockTexts: () => string[];
  getText: () => string;
  getValue: () => unknown;
  importDOMSelection: () => SelectionSnapshot | null;
  insertBreak: () => void;
  insertText: (text: string) => void;
  redo: () => void;
  undo: () => void;
};

type PliteBrowserHarnessHandleMethod = keyof PliteBrowserHarnessHandle;

/**
 * Typed evaluator used only behind the curated editor harness.
 *
 * @internal
 */
export const evaluateHarnessHandle = async <
  TMethod extends PliteBrowserHarnessHandleMethod,
>(
  root: Locator,
  method: TMethod,
  args?: Parameters<PliteBrowserHarnessHandle[TMethod]>,
  errorMessage = `This editor surface does not expose ${method}`
): Promise<ReturnType<PliteBrowserHarnessHandle[TMethod]>> =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        args: innerArgs,
        errorMessage: innerErrorMessage,
        key,
        method: innerMethod,
      }: {
        args: readonly unknown[];
        errorMessage: string;
        key: string;
        method: string;
      }
    ) => {
      const handle = (element as Record<string, any>)[key];
      const fn = handle?.[innerMethod];

      if (typeof fn !== 'function') {
        throw new Error(innerErrorMessage);
      }

      return fn(...innerArgs);
    },
    { args: args ?? [], errorMessage, key: PLITE_BROWSER_HANDLE_KEY, method }
  ) as Promise<ReturnType<PliteBrowserHarnessHandle[TMethod]>>;
