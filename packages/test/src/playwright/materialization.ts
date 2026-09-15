import { expect, type Locator } from '@playwright/test';

import { READY_TIMEOUT_MS, BROWSER_HANDLE_KEY } from './constants';
import type { BrowserDOMPathOptions } from './types';

export const scrollTextPathIntoViewAndCheckMaterialized = async (
  root: Locator,
  path: number[],
  options: BrowserDOMPathOptions = {}
) =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        align,
        key,
        path: innerPath,
      }: {
        align: BrowserDOMPathOptions['align'];
        key: string;
        path: number[];
      }
    ) => {
      const handle = (element as Record<string, any>)[key];

      handle?.scrollPathIntoView?.(innerPath, align ?? 'center');

      return !!element.querySelector(
        `[data-editor-node="text"][data-editor-path="${innerPath.join(',')}"]`
      );
    },
    { align: options.align, key: BROWSER_HANDLE_KEY, path }
  );

export const waitForTextPathMaterialized = async (
  root: Locator,
  path: number[],
  options: BrowserDOMPathOptions = {}
) => {
  await expect
    .poll(
      () => scrollTextPathIntoViewAndCheckMaterialized(root, path, options),
      {
        timeout: options.timeoutMs ?? READY_TIMEOUT_MS,
      }
    )
    .toBe(true);
};
