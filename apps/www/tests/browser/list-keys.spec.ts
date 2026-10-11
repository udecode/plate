import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test, type Page } from '@playwright/test';

const ROUTE = '/blocks/list-demo';

type Block = {
  checked?: boolean;
  children?: Array<{ text?: string }>;
  indent?: number;
  listType?: string;
};

const openListDemo = async (page: Page, caseId: string) => {
  await page.goto(ROUTE, { waitUntil: 'commit' });

  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, caseId, root);

  await editor.ready({ editor: 'visible' });

  const blocks = async () =>
    ((await editor.get.modelValue()) as { children: Block[] }).children.map(
      (block) => ({
        checked: block.checked,
        indent: block.indent,
        listType: block.listType,
        text: block.children?.map((child) => child.text ?? '').join(''),
      })
    );

  return { blocks, editor, root };
};

test('list keys: Shift+Tab keeps a clicked root item and leaves no undo step', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { blocks, root } = await openListDemo(page, 'list-keys:root-untab');

    await root.getByText('Roman 1', { exact: true }).click();
    await page.keyboard.press('End');
    await page.keyboard.type('z');
    await page.keyboard.press('Shift+Tab');

    await expect
      .poll(async () => {
        const value = await blocks();

        return value.find((block) => block.text === 'Roman 1z');
      })
      .toMatchObject({ indent: 1, listType: 'numbered' });

    await page.keyboard.press('ControlOrMeta+z');

    await expect
      .poll(async () => {
        const value = await blocks();

        return value.find((block) => block.text?.startsWith('Roman 1'));
      })
      .toMatchObject({ indent: 1, listType: 'numbered', text: 'Roman 1' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('list keys: Enter at the end of a checked task keeps the new task checked [EDIT-TASK-ENTER-001]', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { blocks, root } = await openListDemo(page, 'list-keys:task-enter');

    await root.getByText('Todo 1', { exact: true }).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await expect
      .poll(async () => {
        const value = await blocks();
        const index = value.findIndex((b) => b.text === 'Todo 1');

        return value[index + 1];
      })
      .toMatchObject({ checked: true, listType: 'task', text: '' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
