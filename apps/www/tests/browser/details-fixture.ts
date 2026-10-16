import type { Locator, Page } from '@playwright/test';

import type { PliteBrowserHandleElement } from '../../../../packages/plitejs/src/react/editable/browser-handle';

export const editorRoot = (page: Page) =>
  page.locator('[data-editor="true"][contenteditable="true"]').first();

export const read = (root: Locator) =>
  root.evaluate((element: PliteBrowserHandleElement) => {
    const handle = element.__EDITOR_BROWSER_HANDLE__!;

    return {
      model: handle.getSelection(),
      dom: handle.getDOMSelection(),
      value: handle.getValue().children,
      focused: document.activeElement === element,
      text: window.getSelection()?.toString(),
    };
  });

export const readValue = (root: Locator) =>
  read(root).then(({ value }) => value);

export const caret = (path: number[], offset: number) => ({
  anchor: { path, offset },
  focus: { path, offset },
});

export const textPath = async (element: Locator) =>
  (await element
    .locator('xpath=ancestor::*[@data-editor-node="element"][1]')
    .getAttribute('data-editor-path'))!
    .split(',')
    .map(Number)
    .concat(0);
