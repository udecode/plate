import type { Locator } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';

export const evaluatePliteBrowserHandle = async <T>(
  root: Locator,
  method: string,
  args: readonly unknown[] = [],
  errorMessage = `This editor surface does not expose ${method}`
): Promise<T> =>
  root.evaluate(
    (
      element: HTMLElement,
      {
        args,
        errorMessage,
        key,
        method,
      }: {
        args: readonly unknown[];
        errorMessage: string;
        key: string;
        method: string;
      }
    ) => {
      const handle = (element as Record<string, any>)[key];
      const fn = handle?.[method];

      if (typeof fn !== 'function') {
        throw new Error(errorMessage);
      }

      return fn(...args);
    },
    { args, errorMessage, key: PLITE_BROWSER_HANDLE_KEY, method }
  ) as Promise<T>;
