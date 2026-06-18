import { expect, type Locator } from '@playwright/test';

import { READY_TIMEOUT_MS, SLATE_BROWSER_HANDLE_KEY } from './constants';
import type { SlateBrowserDOMPathOptions } from './types';

export const scrollTextPathIntoViewAndCheckMaterialized = async (
  root: Locator,
  path: number[],
  options: SlateBrowserDOMPathOptions = {}
) =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        align,
        key,
        path,
      }: {
        align: SlateBrowserDOMPathOptions['align'];
        key: string;
        path: number[];
      }
    ) => {
      const handle = (element as Record<string, any>)[key];

      handle?.scrollPathIntoView?.(path, align ?? 'center');

      return !!element.querySelector(
        `[data-slate-node="text"][data-slate-path="${path.join(',')}"]`
      );
    },
    { align: options.align, key: SLATE_BROWSER_HANDLE_KEY, path }
  );

export const waitForTextPathMaterialized = async (
  root: Locator,
  path: number[],
  options: SlateBrowserDOMPathOptions = {}
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
