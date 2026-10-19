import type { Frame, Page } from '@playwright/test';

import type { EditorSurfaceOptions } from './types';

export type SurfaceTarget = Page | Frame;

export const resolveSurface = async (
  page: Page,
  options: EditorSurfaceOptions = {}
): Promise<SurfaceTarget> => {
  if (!options.frame) {
    return page;
  }

  const iframe = page.locator(options.frame).first();
  await iframe.waitFor();
  const handle = await iframe.elementHandle();

  if (!handle) {
    throw new Error(
      `Cannot resolve iframe handle for selector ${options.frame}`
    );
  }

  const frame = await handle.contentFrame();

  if (!frame) {
    throw new Error(
      `Cannot resolve content frame for selector ${options.frame}`
    );
  }

  return frame;
};
