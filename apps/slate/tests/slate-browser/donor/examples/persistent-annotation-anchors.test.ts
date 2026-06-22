import { expect, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

test.describe('persistent annotation anchors example', () => {
  test('keeps the annotation anchor attached across fragment insert, text insert, and clear', async ({
    page,
  }) => {
    const editor = await openExample(
      page,
      'slate/persistent-annotation-anchors',
      {
        ready: {
          selector: '#document-outline',
        },
      }
    );

    await expect(editor.page.locator('#document-outline')).toHaveText(
      'alpha|beta'
    );
    await expect(editor.page.locator('#left-projection')).toHaveText('none');
    await expect(editor.page.locator('#right-projection')).toHaveText('none');

    await editor.page.locator('#add-anchor').click();

    await expect(editor.page.locator('#left-projection')).toHaveText(
      'comment-anchor:1-4:annotation:persistent'
    );
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText(
      'comment-anchor:Comment anchor:0:1|0:4'
    );
    await expect(editor.page.locator('#widget-panel')).toHaveText(
      'comment-widget:annotation:visible:Comment widget'
    );

    await editor.page.locator('#insert-fragment').click();

    await expect(editor.page.locator('#document-outline')).toHaveText(
      'intro-a|intro-balpha|beta'
    );
    await expect(editor.page.locator('#left-text')).toHaveText('intro-balpha');
    await expect(editor.page.locator('#left-projection')).toHaveText(
      'comment-anchor:8-11:annotation:persistent'
    );
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText(
      'comment-anchor:Comment anchor:1:8|1:11'
    );
    await expect(editor.page.locator('#widget-panel')).toHaveText(
      'comment-widget:annotation:visible:Comment widget'
    );
    await expect(editor.page.locator('#right-projection')).toHaveText('none');

    await editor.page.locator('#insert-prefix').click();

    await expect(editor.page.locator('#document-outline')).toHaveText(
      'intro-a|intro-b>alpha|beta'
    );
    await expect(editor.page.locator('#left-text')).toHaveText('intro-b>alpha');
    await expect(editor.page.locator('#left-projection')).toHaveText(
      'comment-anchor:9-12:annotation:persistent'
    );
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText(
      'comment-anchor:Comment anchor:1:9|1:12'
    );

    await editor.page.locator('#clear-anchor').click();

    await expect(editor.page.locator('#left-projection')).toHaveText('none');
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText('none');
    await expect(editor.page.locator('#widget-panel')).toHaveText('none');
  });

  test('collapses annotation projections when the anchored text is deleted', async ({
    page,
  }) => {
    const editor = await openExample(
      page,
      'slate/persistent-annotation-anchors',
      {
        ready: {
          selector: '#document-outline',
        },
      }
    );

    await editor.page.locator('#add-anchor').click();

    await expect(editor.page.locator('#left-projection')).toHaveText(
      'comment-anchor:1-4:annotation:persistent'
    );
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText(
      'comment-anchor:Comment anchor:0:1|0:4'
    );

    await editor.page.locator('#delete-anchor-text').click();

    await expect(editor.page.locator('#document-outline')).toHaveText(
      'aa|beta'
    );
    await expect(editor.page.locator('#left-text')).toHaveCount(0);
    await expect(editor.page.locator('#left-projection')).toHaveCount(0);
    await expect(editor.page.locator('#annotation-sidebar')).toHaveText(
      'comment-anchor:Comment anchor:0:1|0:1'
    );
    await expect(editor.page.locator('#widget-panel')).toHaveText(
      'comment-widget:annotation:visible:Comment widget'
    );
  });
});
