import { test, expect, Page } from '@playwright/test';
import { clickAtPath, getEditable, getEditorHandle, getNodeByPath, setSelection } from '../packages/playwright/src';

const getPlaygroundEditable = (page: Page) =>
  getEditable(page).locator('visible=true');

test('playground', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  const editable = getPlaygroundEditable(page);
  const editorHandle = await getEditorHandle(page, editable);

  // Focus the editor
  await clickAtPath(page, editorHandle, [0]);

  // Select the heading
  await setSelection(page, editorHandle, [0]);

  await page.keyboard.type('Testing with Playwright');

  const heading = await getNodeByPath(page, editorHandle, [0]);

  expect(await heading.jsonValue()).toMatchObject({
    type: 'h1',
    children: [{ text: 'Testing with Playwright' }],
  });
});
