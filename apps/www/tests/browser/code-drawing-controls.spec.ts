import { createPliteBrowserEditorHarness } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';
import type { Value } from 'platejs';

test('code, language, and view controls follow a drawing after its path changes', async ({
  page,
}) => {
  await page.goto('/blocks/code-drawing-demo', { waitUntil: 'commit' });
  const root = page.locator('.plite-editor');
  const editor = createPliteBrowserEditorHarness(
    page,
    'code-drawing:controls',
    root
  );
  await editor.ready({ editor: 'visible', text: 'Code Drawing' });
  const drawing = root.locator('.plite-codeDrawing');
  await expect(drawing).toHaveAttribute('data-plite-path', '2');
  await editor.selection.collapse({ path: [1, 0], offset: 0 });
  await editor.focus();
  await page.keyboard.press('Enter');
  await expect(drawing).toHaveAttribute('data-plite-path', '3');
  const getDrawing = async () => {
    const value = (await editor.get.modelValue()) as { children: Value };

    return value.children.find((node) => node.type === 'codeDrawing');
  };

  const code = 'graph TD\n  A --> B';
  await drawing.getByPlaceholder('Enter your code here...').fill(code);
  await expect.poll(getDrawing).toMatchObject({ code, language: 'mermaid' });
  await drawing.getByRole('combobox').filter({ hasText: 'Split' }).click();
  await page.getByRole('option', { name: 'Code', exact: true }).click();
  await expect.poll(getDrawing).toMatchObject({ code, view: 'code' });
  await drawing.getByRole('combobox').filter({ hasText: 'Mermaid' }).click();
  await page.getByRole('option', { name: 'Graphviz', exact: true }).click();
  const graphviz = 'digraph { A -> B }';
  await drawing.getByPlaceholder('Enter your code here...').fill(graphviz);
  await expect.poll(getDrawing).toMatchObject({
    code: graphviz,
    language: 'graphviz',
    view: 'code',
  });
  await expect(drawing).toHaveAttribute('data-plite-path', '3');
  await expect(root).toContainText('Create diagrams from code');
});

test('drawing controls follow the mobile breakpoint and toolbar overflow remains scrollable', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 767, height: 844 });
  await page.goto('/blocks/code-drawing-demo', { waitUntil: 'commit' });
  const drawing = page.locator('.plite-codeDrawing');
  const layout = drawing.locator('.group.my-4').first();
  const controls = drawing.getByRole('toolbar').first();

  await expect(layout).toHaveCSS('flex-direction', 'column-reverse');
  await expect(controls).toHaveCSS('position', 'static');
  await expect(controls).toHaveCSS('opacity', '1');
  const fixedToolbar = page.getByRole('toolbar').first();
  await expect(fixedToolbar).toHaveCSS('scrollbar-width', 'none');
  await expect
    .poll(() =>
      fixedToolbar.evaluate(
        (element) => element.scrollWidth > element.clientWidth
      )
    )
    .toBe(true);
  await fixedToolbar.hover();
  await page.mouse.wheel(300, 0);
  await expect
    .poll(() => fixedToolbar.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await testInfo.attach('mobile-controls-and-toolbar', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });

  await page.setViewportSize({ width: 768, height: 844 });
  await expect(layout).toHaveCSS('flex-direction', 'row');
  await expect(controls).toHaveCSS('position', 'absolute');
  await page.setViewportSize({ width: 767, height: 844 });
  await expect(controls).toHaveCSS('position', 'static');
  await controls.getByRole('combobox').filter({ hasText: 'Split' }).click();
  await page.getByRole('option', { name: 'Code', exact: true }).click();
  await expect(
    drawing.getByRole('combobox').filter({ hasText: 'Code' })
  ).toBeVisible();
  await expect(
    drawing.getByPlaceholder('Enter your code here...')
  ).toBeVisible();
});
