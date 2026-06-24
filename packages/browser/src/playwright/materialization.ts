import { expect, type Locator } from '@playwright/test';

import { READY_TIMEOUT_MS, PLITE_BROWSER_HANDLE_KEY } from './constants';
import type { PliteBrowserDOMPathOptions } from './types';

export const scrollTextPathIntoViewAndCheckMaterialized = async (
  root: Locator,
  path: number[],
  options: PliteBrowserDOMPathOptions = {}
) =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        align,
        key,
        path,
      }: {
        align: PliteBrowserDOMPathOptions['align'];
        key: string;
        path: number[];
      }
    ) => {
      const handle = (element as Record<string, any>)[key];

      handle?.scrollPathIntoView?.(path, align ?? 'center');

      return !!element.querySelector(
        `[data-plite-node="text"][data-plite-path="${path.join(',')}"]`
      );
    },
    { align: options.align, key: PLITE_BROWSER_HANDLE_KEY, path }
  );

export const waitForTextPathMaterialized = async (
  root: Locator,
  path: number[],
  options: PliteBrowserDOMPathOptions = {}
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
