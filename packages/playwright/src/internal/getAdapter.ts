import type { JSHandle, Page } from '@playwright/test';

import type { TPlatePlaywrightAdapter } from '../types';

export const getAdapter = (
  page: Page
): Promise<JSHandle<TPlatePlaywrightAdapter>> =>
  page.evaluateHandle(() => {
    const adapter = window.platePlaywrightAdapter;

    if (!adapter) {
      throw new Error(
        'window.platePlaywrightAdapter not found. Ensure that <PlatePlaywrightAdapter /> is rendered as a child of your Plate editor.'
      );
    }

    return adapter;
  }) as any;
