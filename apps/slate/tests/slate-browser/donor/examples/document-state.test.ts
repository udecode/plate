import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  openExample,
  recordSlateBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

type EditorHarness = Awaited<ReturnType<typeof openExample>>;

const bodyEndPoint = {
  path: [1, 0],
  offset: 'Title changes never need invisible nodes.'.length,
};
const bodyStartSelection = {
  anchor: { path: [0, 0], offset: 'The '.length },
  focus: { path: [0, 0], offset: 'The '.length },
};
const focusMutationPrefix = 'Focus mutation: ';
const focusMutationSelection = {
  anchor: { path: [0, 0], offset: `${focusMutationPrefix}The `.length },
  focus: { path: [0, 0], offset: `${focusMutationPrefix}The `.length },
};

const appendInputText = async (page: Page, input: Locator, text: string) => {
  await input.click();
  await input.evaluate((element) => {
    const inputElement = element as HTMLInputElement;
    inputElement.setSelectionRange(
      inputElement.value.length,
      inputElement.value.length
    );
  });
  await page.keyboard.type(text);
};

const insertAtBodyEnd = async (editor: EditorHarness, text: string) => {
  await editor.selection.collapse(bodyEndPoint);
  await editor.insertText(text);
};

test.describe('document state example', () => {
  test('keeps focus in the title input while writing a state field', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');

    await editor.click();
    await expect(editor.root).toBeFocused();

    await appendInputText(page, titleInput, ' typed');
    await expect(titleInput).toBeFocused();

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Brief typed');
    await expect(editor.root).not.toBeFocused();
  });

  test('keeps model selection when focus leaves the editor', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop blur selection proof'
    );

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });
    const titleInput = page.getByLabel('Document title');

    await editor.selection.selectDOM(bodyStartSelection);
    await editor.assert.selection(bodyStartSelection);

    await titleInput.click();

    await expect(titleInput).toBeFocused();
    await expect(editor.root).not.toBeFocused();
    await expect.poll(() => editor.selection.get()).toEqual(bodyStartSelection);

    await editor.focus();

    await expect(editor.root).toBeFocused();
    await expect.poll(() => editor.selection.get()).toEqual(bodyStartSelection);

    await page.keyboard.type('edited ');

    await expect(editor.root).toContainText(
      'The edited body is still normal Slate content.'
    );
  });

  test('keeps unfocused editor updates from importing external selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop unfocused selection proof'
    );

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });
    const titleInput = page.getByLabel('Document title');

    await editor.selection.selectDOM(bodyStartSelection);
    await editor.assert.selection(bodyStartSelection);
    await titleInput.click();
    await titleInput.press(
      process.platform === 'darwin' ? 'Meta+A' : 'Control+A'
    );
    await expect(titleInput).toBeFocused();

    await editor.root.evaluate((element) => {
      const handle = (
        element as HTMLElement & {
          __slateBrowserHandle?: {
            applyOperations: (
              operations: readonly Record<string, unknown>[],
              options?: Record<string, unknown>
            ) => void;
          };
        }
      ).__slateBrowserHandle;

      if (!handle) {
        throw new Error('Missing Slate browser handle');
      }

      handle.applyOperations(
        [
          {
            offset: 0,
            path: [1, 0],
            root: 'main',
            text: 'Remote ',
            type: 'insert_text',
          },
        ],
        {
          metadata: {
            collab: { origin: 'remote', saveToHistory: false },
            history: { mode: 'skip' },
            selection: { dom: 'preserve', focus: false, scroll: false },
          },
          tag: ['collaboration', 'remote-content'],
        }
      );
    });

    await expect(editor.root).toContainText('Remote Title changes');
    await expect(titleInput).toBeFocused();
    await expect.poll(() => editor.selection.get()).toEqual(bodyStartSelection);
  });

  test('keeps focus-event content mutations from breaking selection repair', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop focus-event mutation proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });
    const titleInput = page.getByLabel('Document title');

    await editor.selection.selectDOM(bodyStartSelection);
    await editor.assert.selection(bodyStartSelection);
    await titleInput.click();
    await expect(titleInput).toBeFocused();

    await editor.root.evaluate((element, prefix) => {
      const root = element as HTMLElement & {
        __slateBrowserHandle?: {
          applyOperations: (
            operations: readonly Record<string, unknown>[],
            options?: Record<string, unknown>
          ) => void;
        };
      };

      root.addEventListener(
        'focus',
        () => {
          const handle = root.__slateBrowserHandle;

          if (!handle) {
            throw new Error('Missing Slate browser handle');
          }

          handle.applyOperations(
            [
              {
                offset: 0,
                path: [0, 0],
                root: 'main',
                text: prefix,
                type: 'insert_text',
              },
            ],
            {
              metadata: {
                history: { mode: 'skip' },
                selection: { dom: 'preserve', focus: false, scroll: false },
              },
              tag: ['focus-mutation'],
            }
          );
        },
        { once: true }
      );
    }, focusMutationPrefix);

    await editor.focus();

    await expect(editor.root).toBeFocused();
    await expect(editor.root).toContainText(
      'Focus mutation: The body is still normal Slate content.'
    );
    await expect
      .poll(() => editor.selection.get())
      .toEqual(focusMutationSelection);
    runtimeErrors.assertNone();

    await page.keyboard.type('typed ');

    await expect(editor.root).toContainText(
      'Focus mutation: The typed body is still normal Slate content.'
    );
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: {
          path: [0, 0],
          offset: `${focusMutationPrefix}The typed `.length,
        },
        focus: {
          path: [0, 0],
          offset: `${focusMutationPrefix}The typed `.length,
        },
      });
    runtimeErrors.assertNone();
    runtimeErrors.stop();
  });

  test('keeps title input undo outside editor focus repair', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');
    const commitStatus = page.locator('#document-state-commit');

    await insertAtBodyEnd(editor, 'p');
    await expect(editor.root).toContainText('nodes.p');

    await appendInputText(page, titleInput, 'p');

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Briefp');

    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z'
    );

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(commitStatus).toContainText('state:document.title');
    await expect(commitStatus).toContainText('tags:historic');
    await expect(editor.root).toContainText('nodes.p');
    await expect(editor.root).not.toBeFocused();
    await expect(page.locator('body')).not.toContainText('Could not set focus');
    expect(pageErrors).toEqual([]);
  });

  test('keeps title input undo redo outside editor focus repair', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');
    const commitStatus = page.locator('#document-state-commit');

    await insertAtBodyEnd(editor, 'p');
    await expect(editor.root).toContainText('nodes.p');

    await appendInputText(page, titleInput, 'p');

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Briefp');

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+Z`);

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(commitStatus).toContainText('state:document.title');
    await expect(commitStatus).toContainText('tags:historic');

    await page.keyboard.press(`${modifier}+Shift+Z`);

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Briefp');
    await expect(commitStatus).toContainText('state:document.title');
    await expect(commitStatus).toContainText('tags:historic');
    await expect(editor.root).toContainText('nodes.p');
    await expect(editor.root).not.toBeFocused();
    await expect(page.locator('body')).not.toContainText('Could not set focus');
    expect(pageErrors).toEqual([]);
  });

  test('keeps title input focused while repeated undo crosses editor history', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');
    const commitStatus = page.locator('#document-state-commit');

    await insertAtBodyEnd(editor, 'p');
    await expect(editor.root).toContainText('nodes.p');

    await appendInputText(page, titleInput, 'p');

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Briefp');

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+Z`);

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(editor.root).toContainText('nodes.p');
    await expect(commitStatus).toContainText('state:document.title');
    await expect(commitStatus).toContainText('tags:historic');

    await page.keyboard.press(`${modifier}+Z`);

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(editor.root).not.toContainText('nodes.p');
    await expect(editor.root).not.toBeFocused();
    await expect.poll(() => editor.get.modelText()).not.toContain('nodes.p');
    await expect(commitStatus).toContainText('ops:remove_text');
    await expect(commitStatus).toContainText('tags:historic');
    await expect(page.locator('body')).not.toContainText('Could not set focus');
    expect(pageErrors).toEqual([]);
  });

  test('keeps state-only history undo from focusing the editor', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');

    await insertAtBodyEnd(editor, 'p');
    await expect(editor.root).toContainText('nodes.p');

    await appendInputText(page, titleInput, 'p');
    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Planning Briefp');

    await page.getByRole('button', { name: 'Undo document change' }).click();

    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(editor.root).toContainText('nodes.p');
    await expect(editor.root).not.toBeFocused();
    await expect(page.locator('body')).not.toContainText('Could not set focus');
  });

  test('keeps body editing usable after editing the title input', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.insertText('Body prefix: ');

    await expect(editor.root).toContainText('Body prefix: ');
    await expect(titleInput).toHaveValue('Q2 Planning Brief');

    await titleInput.click();
    await titleInput.press(
      process.platform === 'darwin' ? 'Meta+A' : 'Control+A'
    );
    await page.keyboard.type('Typed title');

    await expect(titleInput).toHaveValue('Typed title');
    await expect(editor.root).toContainText('Body prefix: ');

    await insertAtBodyEnd(editor, ' Body suffix');

    await expect(titleInput).toHaveValue('Typed title');
    await expect(editor.root).toContainText('Body suffix');
    const bodyText = await editor.get.modelText();
    expect(bodyText).toContain('Body prefix: ');
    expect(bodyText).toContain(' Body suffix');
  });

  test('keeps Cyrillic input stable with spellcheck enabled', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop WebKit native-input guard'
    );

    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const spellcheckInput = page.getByLabel('Enable spellcheck');
    const commitStatus = page.locator('#document-state-commit');

    await expect(spellcheckInput).toBeChecked();
    await expect(editor.root).toHaveAttribute('spellcheck', 'true');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await page.keyboard.insertText('Привет ');

    await expect(editor.root).toContainText(
      'Привет The body is still normal Slate content.'
    );
    await expect(commitStatus).toContainText('ops:insert_text');
    await expect(commitStatus).toContainText('state:none');
    await editor.assert.text(
      'Привет The body is still normal Slate content.Title changes never need invisible nodes.'
    );
  });

  test('edits document metadata through state fields without hiding it in content', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/document-state', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#document-state-editor-surface',
      },
    });

    const titleInput = page.getByLabel('Document title');
    const spellcheckInput = page.getByLabel('Enable spellcheck');
    const titleStatus = page.locator('#document-state-title');
    const spellcheckStatus = page.locator('#document-state-spellcheck');
    const commitStatus = page.locator('#document-state-commit');

    await expect(page.locator('.example-page-title')).toContainText(
      'Document State'
    );
    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(titleStatus).toHaveText('title:Q2 Planning Brief');
    await expect(spellcheckStatus).toHaveText('spellcheck:on');
    await expect(editor.root).toContainText(
      'The body is still normal Slate content.'
    );

    await page.getByRole('button', { name: 'Set Q3 title' }).click();

    await expect(titleInput).toHaveValue('Q3 Launch Brief');
    await expect(titleStatus).toHaveText('title:Q3 Launch Brief');
    await expect(commitStatus).toContainText('state:document.title');
    await expect(editor.root).not.toContainText('Q3 Launch Brief');

    await page.getByRole('button', { name: 'Undo document change' }).click();

    await expect(titleInput).toHaveValue('Q2 Planning Brief');
    await expect(titleStatus).toHaveText('title:Q2 Planning Brief');

    await page.getByRole('button', { name: 'Redo document change' }).click();

    await expect(titleInput).toHaveValue('Q3 Launch Brief');
    await expect(titleStatus).toHaveText('title:Q3 Launch Brief');

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.insertText('Draft: ');

    await expect(commitStatus).toContainText('ops:insert_text');
    await expect(commitStatus).toContainText('state:none');
    await expect(titleInput).toHaveValue('Q3 Launch Brief');
    await editor.assert.text(
      'Draft: The body is still normal Slate content.Title changes never need invisible nodes.'
    );

    await spellcheckInput.uncheck();

    await expect(spellcheckStatus).toHaveText('spellcheck:off');
    await expect(commitStatus).toContainText(
      'state:document.settings.spellcheck'
    );

    await page.getByRole('button', { name: 'Receive remote title' }).click();

    await expect(titleInput).toHaveValue('Remote Q2 Brief');
    await expect(titleStatus).toHaveText('title:Remote Q2 Brief');
    await expect(commitStatus).toContainText('tags:collaboration,remote-state');
    await editor.assert.text(
      'Draft: The body is still normal Slate content.Title changes never need invisible nodes.'
    );
  });
});
