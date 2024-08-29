import type { Locator, Page } from '@playwright/test';

export const getEditable = (context: Locator | Page) =>
  context.locator('[data-slate-editor]');
