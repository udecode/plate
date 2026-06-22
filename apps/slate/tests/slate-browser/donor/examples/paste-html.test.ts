import { expect, type Locator, type Page, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  createSlateBrowserClipboardPasteGauntlet,
  createSlateBrowserDropDataGauntlet,
  openExample,
  recordSlateBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const GOOGLE_DOCS_FONT_SIZE_HTML = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid"><p dir="ltr" style="line-height:1.56;margin-top:10pt;margin-bottom:0pt;"><span style="font-size:24pt;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">Random text at </span><span style="font-size:36pt;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">36 pt</span></p></b>`;

const GOOGLE_DOCS_BIU_HTML = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Bold</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Italic</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre-wrap;">underline</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre-wrap;">Bold Italic Underline</span></p></b><br class="Apple-interchange-newline">`;

const WORD_COMMENT_HTML = `<!--StartFragment--><p class="MsoNormal"><span style="mso-bidi-font-weight:bold">Visible Word text</span></p><!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--EndFragment-->`;

const GOOGLE_DOCS_TABS_HTML = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-tabs"><p dir="ltr" style="line-height:1.38;margin-left:36pt;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Hello</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"><span class="Apple-tab-span" style="white-space:pre;">\t</span></span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">world</span></p><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Hello</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"><span class="Apple-tab-span" style="white-space:pre;">\t</span></span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">world</span></b>`;
const SUP_SUB_HTML = `<p>10<sup>12</sup></p><p>H<sub>2</sub>O</p><p><span style="vertical-align: super;">style super</span><span style="vertical-align: sub;">style sub</span></p>`;

const SEMANTIC_B_HTML = `<p><b>Semantic Bold</b><b style="font-weight:normal;"> Normal Wrapper</b></p>`;

const PARAGRAPH_ALIGN_HTML = `<p align="right">Right aligned</p><p align="right" style="text-align: center;">CSS wins</p><p align="super-weird-stuff">Invalid ignored</p>`;

const MULTILINE_EXTRA_NEWLINES_HTML =
  '<p>Hello\n</p>\n\n<p>\n\nWorld\n\n</p>\n\n<p>Hello\n\n   World   \n\n!\n\n</p><p>Hello <b>World</b> <i>!</i></p>';

const MIXED_BLOCK_STYLE_HTML =
  '<h1>Heading</h1><blockquote>Quote</blockquote><pre>code</pre>';

const CODE_SOURCE_TEXT = `function run() {
  return true;
}`;

const CODE_SOURCE_HTML_CASES = [
  {
    name: 'Quip-style pre with br line breaks',
    html: `<pre>function run() {<br>  return true;<br>}</pre>`,
  },
  {
    name: 'code element with br line breaks',
    html: `<code data-language="javascript" data-highlight-language="javascript"><span>function run() {</span><br><span>  return true;</span><br><span>}</span></code>`,
  },
  {
    name: 'VS Code-style whitespace pre divs',
    html: `<div style="white-space: pre;"><div><span>function</span> run() {</div><div>  return true;</div><div>}</div></div>`,
  },
  {
    name: 'VS Code-style split leading whitespace spans',
    html: `<div style="white-space: pre;"><div><span>function</span> run() {</div><div><span>  </span><span style="color:#569cd6;">return</span> true;</div><div>}</div></div>`,
  },
  {
    name: 'GitHub-style code table without line gutters',
    html: `<table class="highlight"><tbody><tr><td class="blob-num" data-line-number="1"></td><td class="blob-code blob-code-inner js-file-line">function run() {</td></tr><tr><td class="blob-num" data-line-number="2"></td><td class="blob-code blob-code-inner js-file-line">  return true;</td></tr><tr><td class="blob-num" data-line-number="3"></td><td class="blob-code blob-code-inner js-file-line">}</td></tr></tbody></table>`,
  },
] as const;

const GOOGLE_DOCS_TABLE_HTML = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid"><div dir="ltr"><table style="border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col><col><col></colgroup><tbody><tr><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">a</span></p></td><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">b</span></p><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">b</span></p></td><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">c</span></p></td></tr><tr><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">d</span></p></td><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">e</span></p></td><td><p><span style="font-size:11pt;font-family:Arial;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">f</span></p></td></tr></tbody></table></div></b>`;

const QUIP_TABLE_HTML = `<meta charset="utf-8"><table style="border-collapse:collapse;"><col style="width:90px;"><col style="width:90px;"><col style="width:90px;"><tr><td style="border:1px solid rgb(230,230,230);text-align:left;">a</td><td style="border:1px solid rgb(230,230,230);text-align:left;">b<br>b</td><td style="border:1px solid rgb(230,230,230);text-align:left;">c</td></tr><tr><td style="border:1px solid rgb(230,230,230);text-align:left;">d</td><td style="border:1px solid rgb(230,230,230);text-align:left;">e</td><td style="border:1px solid rgb(230,230,230);text-align:left;">f</td></tr></table>`;

const WORD_TABLE_LINK_HTML = `<meta charset="utf-8"><table><tbody><tr><td><p><a href="https://example.com">linked</a></p></td><td><p>plain</p></td></tr></tbody></table>`;

const WINDOWS_TAB_LINK_HTML = `<p><a href="http://localhost/foobar">foo:bar.pdf</a></p>`;

const GOOGLE_DOCS_EMPTY_PARAGRAPH_HTML = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-empty-paragraph"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">paragraph 1</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><br></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">paragraph 2</span></p></b>`;

const GOOGLE_SHEETS_TABLE_HTML = `<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #cccccc;}br {mso-data-placement:same-cell;}--></style><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none" data-sheets-root="1"><tbody><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;font-weight:bold;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Surface&quot;}">Surface</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;font-style:italic;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;MWP_WORK_LS_COMPOSER&quot;}">MWP_WORK_LS_COMPOSER</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-decoration:underline;text-align:right;" data-sheets-value="{&quot;1&quot;:3,&quot;3&quot;:77349}">77349</td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Slate&quot;}">Slate</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-decoration:line-through;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;old editor&quot;}">old editor</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;mixed bold&quot;}"><span style="font-size:10pt;font-family:Arial;font-style:normal;">mixed </span><span style="font-size:10pt;font-family:Arial;font-weight:bold;font-style:normal;">bold</span></td></tr></tbody></table>`;

const HEADER_TABLE_HTML = `<table><thead><tr><th>Animal</th><th>Feet</th></tr></thead><tbody><tr><td>Cat</td><td>4</td></tr></tbody></table>`;

const COMMENT_BOUNDED_TABLE_HTML = `<html><body><p>outside before</p><!--StartFragment--><table><tbody><tr><td><p>123</p></td></tr><tr><td><p>456</p></td></tr></tbody></table><!--EndFragment--><p>outside after</p></body></html>`;

const LEXICAL_IMAGE_HTML_CASES = [
  {
    caption: null,
    html: `<p><img alt="" height="inherit" src="/test/image.jpg" width="inherit"></p>`,
    text: '',
  },
  {
    caption: 'caption text',
    html: `<div role="paragraph"><figure><img alt="" height="inherit" src="/test/image.jpg" width="inherit"><figcaption><span style="white-space: pre-wrap">caption text</span></figcaption></figure></div>`,
    text: 'caption text',
  },
] as const;

const LEXICAL_CORE_HTML_BLOCK_CASES = [
  {
    blockTexts: ['Hello!'],
    html: 'Hello!',
    name: 'plain DOM text node',
  },
  {
    blockTexts: ['Hello!', ''],
    html: '<p>Hello!<p>',
    name: 'malformed paragraph pair',
  },
  {
    blockTexts: ['123', '456'],
    html: '123<div>456</div>',
    name: 'single div boundary',
  },
  {
    blockTexts: ['a b c d e', 'f g h'],
    html: '<div>a b <span>c d <span>e</span></span><div>f <span>g h</span></div></div>',
    name: 'nested spans and divs',
  },
  {
    blockTexts: ['123', '456'],
    html: '<div><span>123<div>456</div></span></div>',
    name: 'nested span in a div',
  },
  {
    blockTexts: ['123', '456'],
    html: '<span>123<div>456</div></span>',
    name: 'nested div in a span',
  },
] as const;

const insertDataWithHandle = async (
  editor: Awaited<ReturnType<typeof openExample>>,
  payload: { html?: string; text?: string }
) => {
  await editor.root.evaluate((element: HTMLElement, nextPayload) => {
    const handle = (element as Record<string, any>).__slateBrowserHandle;

    if (!handle?.insertData) {
      throw new Error('Missing Slate browser insertData handle');
    }

    handle.insertData(nextPayload);
  }, payload);
};

const expectFontSizeCloseTo = async (locator: Locator, expectedPx: number) => {
  const getFontSize = () =>
    locator.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize)
    );

  await expect.poll(getFontSize).toBeGreaterThan(expectedPx - 0.01);
  await expect.poll(getFontSize).toBeLessThan(expectedPx + 0.01);
};

test.describe('paste html example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/slate/paste-html')
  );

  const pasteHtml = async (page: Page, htmlContent: string) => {
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').selectText();
    await page.keyboard.press('Backspace');
    await page
      .getByRole('textbox')
      .evaluate((el: HTMLElement, htmlContent: string) => {
        const clipboardEvent = Object.assign(
          new Event('paste', { bubbles: true, cancelable: true }),
          {
            clipboardData: {
              getData: (type = 'text/html') => htmlContent,
              types: ['text/html'],
            },
          }
        );
        el.dispatchEvent(clipboardEvent);
      }, htmlContent);
  };

  test('pasted bold text uses <strong>', async ({ page }) => {
    await pasteHtml(page, '<strong>Hello Bold</strong>');
    await expect(page.locator('strong')).toContainText('Hello');
  });

  test('keeps inline HTML marks bounded to their source text', async ({
    page,
  }) => {
    const textbox = page.getByRole('textbox');

    await pasteHtml(page, '<p>a<strong>b</strong>c</p>');

    await expect(textbox).toContainText('abc');
    await expect(textbox.locator('strong')).toHaveCount(1);
    await expect(textbox.locator('strong')).toHaveText('b');
  });

  test('imports a nested span headline from rich HTML paste', async ({
    page,
  }) => {
    const textbox = page.getByRole('textbox');

    await pasteHtml(page, '<h2><span>References</span></h2>');

    await expect(textbox.locator('h2')).toHaveText('References');
  });

  test('pasted code uses <code>', async ({ page }) => {
    await pasteHtml(page, '<code>console.log("hello from slate!")</code>');
    await expect(
      page.getByRole('textbox').locator('code').filter({ hasText: 'slate!' })
    ).toHaveCount(1);
  });

  test('normalizes block elements pasted from invalid HTML nests', async ({
    page,
  }) => {
    const textbox = page.getByRole('textbox');

    await pasteHtml(
      page,
      '<p>Before<h1>Heading</h1><blockquote>Quote</blockquote><pre>code</pre>After</p>'
    );

    await expect(textbox).toContainText('Before');
    await expect(textbox.locator('h1')).toHaveText('Heading');
    await expect(textbox.locator('blockquote')).toHaveText('Quote');
    await expect(textbox.locator('pre')).toContainText('code');
    await expect(textbox).toContainText('After');
    await expect(textbox.locator('p h1, p blockquote, p pre')).toHaveCount(0);
  });

  test('imports nested blockquote list and code HTML without runtime errors', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const textbox = page.getByRole('textbox');

    try {
      await pasteHtml(
        page,
        '<blockquote><ul><li>test1</li></ul><blockquote><pre><code>test2</code></pre></blockquote></blockquote>'
      );

      await expect(textbox.locator('blockquote')).toHaveCount(2);
      await expect(textbox.locator('ul')).toHaveCount(1);
      await expect(textbox.locator('li')).toHaveText('test1');
      await expect(textbox.locator('pre code')).toHaveText('test2');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('imports a blank paragraph without duplicating its line break', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.clipboard.pasteHtml('<p><br></p><p>after</p>', '\nafter');

    await editor.assert.blockTexts(['', 'after']);
  });

  test('preserves an intentional leading blank block when pasting into an empty paragraph', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Before');
    await editor.insertBreak();
    await editor.insertBreak();
    await editor.insertText('After');
    await editor.selection.collapse({ path: [1, 0], offset: 0 });
    await editor.clipboard.pasteHtml(
      '<p><br></p><p>Inserted</p>',
      '\nInserted'
    );

    await editor.assert.blockTexts(['Before', '', 'Inserted', 'After']);
  });

  test('ignores a newline immediately after a pasted br', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p>Before<br>\nAfter</p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'Before\nAfter',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'Before\nAfter');
    }

    const paragraph = editor.root.locator('p').first();

    await expect(paragraph).toHaveText('Before\nAfter');
    await expect
      .poll(() => paragraph.evaluate((node) => node.textContent))
      .toBe('Before\nAfter');
    await expect.poll(() => editor.get.modelText()).toBe('Before\nAfter');
  });

  test('imports source-code HTML as a code block without source gutters', async ({
    page,
  }) => {
    for (const codeCase of CODE_SOURCE_HTML_CASES) {
      await page.goto('/examples/slate/paste-html');
      const editor = await openExample(page, 'slate/paste-html', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await insertDataWithHandle(editor, {
        html: codeCase.html,
        text: CODE_SOURCE_TEXT,
      });

      await expect(editor.root.locator('pre')).toHaveCount(1);
      await expect(editor.root.locator('table')).toHaveCount(0);
      await expect
        .poll(
          async () =>
            editor.root
              .locator('pre code')
              .evaluate((element) => element.textContent),
          { message: codeCase.name }
        )
        .toBe(CODE_SOURCE_TEXT);
    }
  });

  test('keeps caret editable after rich HTML paste over selected content', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: '<strong>Hello Bold</strong>',
        text: 'Hello Bold',
      });
    } else {
      await editor.clipboard.pasteHtml(
        '<strong>Hello Bold</strong>',
        'Hello Bold'
      );
    }

    await editor.assert.text('Hello Bold');
    await expect(
      editor.root.locator('strong').filter({ hasText: 'Hello' })
    ).toHaveCount(1);
    if (testInfo.project.name === 'mobile') {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 'Hello Bold'.length },
        focus: { path: [0, 0], offset: 'Hello Bold'.length },
      });
    }
    await expect.poll(() => editor.get.selection()).not.toBe(null);

    if (testInfo.project.name === 'mobile') {
      await editor.insertText('!');
    } else {
      await editor.type('!');
    }

    await editor.assert.text('Hello Bold!');
    await expect(editor.root.locator('strong')).toHaveText('Hello Bold!');
    if (testInfo.project.name !== 'mobile') {
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    }
  });

  test('preserves inherited bold through nested pasted HTML marks', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p style="font-weight: bold;">1<strong>2</strong>3</p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: '123' });
    } else {
      await editor.clipboard.pasteHtml(html, '123');
    }

    await editor.assert.blockTexts(['123']);
    await expect(editor.root.locator('strong')).toHaveText(['1', '2', '3']);
  });

  test('does not leak nested pasted bold marks into following blocks', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html =
      '<div><div><strong><strong>Some content in bold</strong></strong></div><span>Text in unstyled span</span></div>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'Some content in bold\nText in unstyled span',
      });
    } else {
      await editor.clipboard.pasteHtml(
        html,
        'Some content in bold\nText in unstyled span'
      );
    }

    await editor.assert.blockTexts([
      'Some content in bold',
      'Text in unstyled span',
    ]);
    await expect(editor.root.locator('p').nth(0).locator('strong')).toHaveText(
      'Some content in bold'
    );
    await expect(editor.root.locator('p').nth(1).locator('strong')).toHaveCount(
      0
    );
  });

  test('preserves whitespace-only pasted bold marks', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p><b> </b></p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: ' ' });
    } else {
      await editor.clipboard.pasteHtml(html, ' ');
    }

    await editor.assert.blockTexts([' ']);
    await expect(editor.root.locator('strong')).toHaveText(' ');
  });

  test('replaces a blank paragraph with pasted block styles', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Before');
    await editor.insertBreak();
    await editor.insertBreak();
    await editor.insertText('After');
    await editor.selection.collapse({ path: [1, 0], offset: 0 });

    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: MIXED_BLOCK_STYLE_HTML,
        text: 'Heading\nQuote\ncode',
      });
    } else {
      await editor.clipboard.pasteHtml(
        MIXED_BLOCK_STYLE_HTML,
        'Heading\nQuote\ncode'
      );
    }

    await editor.assert.modelBlockTexts([
      'Before',
      'Heading',
      'Quote',
      'code',
      'After',
    ]);
    await expect(editor.root.locator('h1')).toHaveText('Heading');
    await expect(editor.root.locator('blockquote')).toHaveText('Quote');
    await expect(editor.root.locator('pre code')).toHaveText('code');
  });

  test('does not fallback insert after same-plain-text native HTML paste', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit synthetic HTML paste does not expose the same beforeinput insert-data trace'
    );

    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.insertText('hello');
    await expect.poll(() => editor.get.modelText()).toBe('hello');

    await editor.selection.selectAll();
    const beforeTraceLength = (await editor.get.kernelTrace()).length;
    await editor.clipboard.pasteHtml('<strong>hello</strong>', 'hello');
    const pasteTrace = (await editor.get.kernelTrace()).slice(
      beforeTraceLength
    );

    await expect.poll(() => editor.get.modelText()).toBe('hello');
    await expect(editor.root.locator('strong')).toHaveText('hello');
    expect(
      pasteTrace.some(
        (entry) =>
          entry.eventFamily === 'beforeinput' &&
          entry.command?.kind === 'insert-data'
      )
    ).toBe(true);
    expect(
      pasteTrace.some(
        (entry) =>
          entry.eventFamily === 'repair' &&
          entry.command?.kind === 'insert-data'
      )
    ).toBe(false);
  });

  test('keeps rich paste text representation stable after editing between blocks', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid"><p dir="ltr"><span style="white-space:pre-wrap;">a</span></p><p dir="ltr"><span style="white-space:pre-wrap;">b</span></p></b>`;

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'a\nb' });
    } else {
      await editor.clipboard.pasteHtml(html, 'a\nb');
    }

    await editor.assert.blockTexts(['a', 'b']);
    await editor.selection.collapse({ path: [0, 0], offset: 1 });
    await editor.focus();
    await editor.root.press('Enter');
    await editor.type('x');

    await expect.poll(() => editor.get.blockTexts()).toEqual(['a', 'x', 'b']);
    await editor.assert.modelBlockTexts(['a', 'x', 'b']);
    expect((await editor.get.blockTexts()).join('\n')).toBe('a\nx\nb');
  });

  test('pastes copied rendered Slate content as an internal fragment before HTML import', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard repro');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const copiedText =
      'Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and its formatting should be preserved.';
    const firstParagraphRemainder =
      " default, pasting content into a Slate editor will use the clipboard's 'text/plain' data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle 'text/html' data. ";

    try {
      await editor.selection.selectDOM({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: copiedText.length },
      });

      const payload = await editor.clipboard.copyPayload();

      expect(payload.html).toContain('data-slate-fragment=');

      await editor.selection.collapse({ path: [0, 0], offset: 2 });
      await editor.focus();
      await editor.root.press('ControlOrMeta+V');

      await editor.assert.blockTexts([
        `By${copiedText}${firstParagraphRemainder}`,
        'This is an example of doing exactly that!',
        copiedText,
      ]);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('treats iOS prediction payload as plain text inside formatted selection', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = 'Prediction';

    await editor.selection.select({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });

    await insertDataWithHandle(editor, {
      html: insertedText,
      text: insertedText,
    });

    await expect(editor.root.locator('code').first()).toHaveText(
      `${insertedText}'text/plain'`
    );
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: insertedText.length },
      focus: { path: [0, 1], offset: insertedText.length },
    });
  });

  for (const coreCase of LEXICAL_CORE_HTML_BLOCK_CASES) {
    test(`imports Lexical core HTML block shape: ${coreCase.name}`, async ({
      page,
    }) => {
      const editor = await openExample(page, 'slate/paste-html', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await insertDataWithHandle(editor, { html: coreCase.html });

      await editor.assert.blockTexts([...coreCase.blockTexts]);
    });
  }

  test('preserves Google Docs font-size spans from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: GOOGLE_DOCS_FONT_SIZE_HTML,
        text: 'Random text at 36 pt',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_DOCS_FONT_SIZE_HTML,
        'Random text at 36 pt'
      );
    }

    await editor.assert.text('Random text at 36 pt');

    const styledLeaves = editor.root.locator('span[style*="font-size"]');
    await expect(styledLeaves).toHaveCount(2);
    await expect(styledLeaves.nth(0)).toHaveText('Random text at ');
    await expect(styledLeaves.nth(0)).toHaveCSS('font-size', '32px');
    await expect(styledLeaves.nth(1)).toHaveText('36 pt');
    await expect(styledLeaves.nth(1)).toHaveCSS('font-size', '48px');
  });

  test('preserves text color and background color from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html =
      '<p><span style="color: rgb(255, 0, 0); background-color: rgb(0, 255, 0); font-size: 18px;">Styled text</span></p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'Styled text',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'Styled text');
    }

    await editor.assert.text('Styled text');
    const importedText = editor.root
      .locator('span[style*="color"]')
      .filter({
        hasText: 'Styled text',
      })
      .first();

    await expect(importedText).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(importedText).toHaveCSS('background-color', 'rgb(0, 255, 0)');
    await expect(importedText).toHaveCSS('font-size', '18px');
  });

  test('preserves nested span font size and underline from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html =
      '<p><span style="font-size: 18px;"><span style="text-decoration: underline;">Example Text</span></span></p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'Example Text' });
    } else {
      await editor.clipboard.pasteHtml(html, 'Example Text');
    }

    await editor.assert.text('Example Text');
    await expect(
      editor.root
        .locator('span[style*="font-size"]')
        .filter({ hasText: 'Example Text' })
    ).toHaveCSS('font-size', '18px');
    await expect(editor.root.locator('u')).toHaveText('Example Text');
  });

  test('preserves a standalone styled span from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<span style="color: rgb(255, 0, 0);">World</span>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'World' });
    } else {
      await editor.clipboard.pasteHtml(html, 'World');
    }

    await editor.assert.text('World');
    await expect(
      editor.root.locator('span[style*="color"]').filter({ hasText: 'World' })
    ).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  test('preserves Google Docs BIU formatting from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: GOOGLE_DOCS_BIU_HTML,
        text: 'Bold\nItalic\nunderline\nBold Italic Underline',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_DOCS_BIU_HTML,
        'Bold\nItalic\nunderline\nBold Italic Underline'
      );
    }

    const paragraphs = editor.root.locator('p');
    const bold = paragraphs
      .filter({ hasText: /^Bold$/ })
      .locator('span[style*="font-size"]');
    const italic = paragraphs
      .filter({ hasText: /^Italic$/ })
      .locator('span[style*="font-size"]');
    const underline = paragraphs
      .filter({ hasText: /^underline$/ })
      .locator('span[style*="font-size"]');
    const combined = paragraphs
      .filter({ hasText: /^Bold Italic Underline$/ })
      .locator('span[style*="font-size"]');

    await expectFontSizeCloseTo(bold, 14.6667);
    await expect(bold.locator('strong')).toHaveText('Bold');
    await expect(italic.locator('em')).toHaveText('Italic');
    await expect(underline.locator('u')).toHaveText('underline');
    await expect(combined.locator('strong')).toHaveText(
      'Bold Italic Underline'
    );
    await expect(combined.locator('em')).toHaveText('Bold Italic Underline');
    await expect(combined.locator('u')).toHaveText('Bold Italic Underline');
  });

  test('keeps rich paste after a stale Shift tab-switch shortcut', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop modifier paste proof'
    );

    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const text = 'Bold\nItalic\nunderline\nBold Italic Underline';

    await editor.selection.selectAll();
    await editor.root.evaluate((element: HTMLElement) => {
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code: 'BracketLeft',
          key: '[',
          metaKey: true,
          shiftKey: true,
        })
      );
    });

    await editor.clipboard.pasteHtml(GOOGLE_DOCS_BIU_HTML, text);

    const paragraphs = editor.root.locator('p');
    const bold = paragraphs
      .filter({ hasText: /^Bold$/ })
      .locator('span[style*="font-size"]');
    const italic = paragraphs
      .filter({ hasText: /^Italic$/ })
      .locator('span[style*="font-size"]');
    const underline = paragraphs
      .filter({ hasText: /^underline$/ })
      .locator('span[style*="font-size"]');
    const combined = paragraphs
      .filter({ hasText: /^Bold Italic Underline$/ })
      .locator('span[style*="font-size"]');

    await expect(bold.locator('strong')).toHaveText('Bold');
    await expect(italic.locator('em')).toHaveText('Italic');
    await expect(underline.locator('u')).toHaveText('underline');
    await expect(combined.locator('strong')).toHaveText(
      'Bold Italic Underline'
    );
    await expect(combined.locator('em')).toHaveText('Bold Italic Underline');
    await expect(combined.locator('u')).toHaveText('Bold Italic Underline');
  });

  test('preserves Google Docs list marks across soft line breaks', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-list-mark"><ul><li><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;text-decoration:none;white-space:pre-wrap;">Hello</span><br><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;text-decoration:none;white-space:pre-wrap;">World</span></li></ul></b>`;
    const text = 'Hello\nWorld';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    const item = editor.root.locator('li').first();

    await expect(item).toContainText('Hello');
    await expect(item).toContainText('World');
    await expect(item.locator('em')).toHaveText('Hello');
    await expect(item.locator('strong')).toHaveCount(0);
    await expect(item.locator('em').filter({ hasText: 'World' })).toHaveCount(
      0
    );
  });

  test('preserves nested underline formatting from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p><u><span class="Editor_underline">text</span></u></p>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'text' });
    } else {
      await editor.clipboard.pasteHtml(html, 'text');
    }

    await expect(editor.root.locator('u')).toHaveText('text');
    await expect(editor.root.locator('p')).toHaveText('text');
  });

  test('preserves superscript and subscript formatting from HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: SUP_SUB_HTML,
        text: '1012\nH2O\nstyle superstyle sub',
      });
    } else {
      await editor.clipboard.pasteHtml(
        SUP_SUB_HTML,
        '1012\nH2O\nstyle superstyle sub'
      );
    }

    const paragraphs = editor.root.locator('p');
    await expect(paragraphs.nth(0).locator('sup')).toHaveText('12');
    await expect(paragraphs.nth(1).locator('sub')).toHaveText('2');
    await expect(paragraphs.nth(2).locator('sup')).toHaveText('style super');
    await expect(paragraphs.nth(2).locator('sub')).toHaveText('style sub');
  });

  test('keeps semantic b bold without marking normal-weight wrappers', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: SEMANTIC_B_HTML,
        text: 'Semantic Bold Normal Wrapper',
      });
    } else {
      await editor.clipboard.pasteHtml(
        SEMANTIC_B_HTML,
        'Semantic Bold Normal Wrapper'
      );
    }

    await expect(
      editor.root.locator('strong').filter({ hasText: 'Semantic Bold' })
    ).toHaveCount(1);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'Normal Wrapper' })
    ).toHaveCount(0);
  });

  test('imports Google Docs tab spans and loose line from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: GOOGLE_DOCS_TABS_HTML,
        text: 'Hello\tworld\nHello\tworld',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_DOCS_TABS_HTML,
        'Hello\tworld\nHello\tworld'
      );
    }

    await expect
      .poll(async () =>
        editor.root
          .locator('p')
          .evaluateAll((paragraphs) =>
            paragraphs
              .map((paragraph) => paragraph.textContent)
              .filter((text) => text)
          )
      )
      .toEqual(['Hello\tworld', 'Hello\tworld']);
  });

  test('imports paragraph alignment from CSS and legacy align HTML', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: PARAGRAPH_ALIGN_HTML,
        text: 'Right aligned\nCSS wins\nInvalid ignored',
      });
    } else {
      await editor.clipboard.pasteHtml(
        PARAGRAPH_ALIGN_HTML,
        'Right aligned\nCSS wins\nInvalid ignored'
      );
    }

    await editor.assert.text('Right alignedCSS winsInvalid ignored');

    const paragraphs = editor.root.locator('p');
    await expect(paragraphs.filter({ hasText: /^Right aligned$/ })).toHaveCount(
      1
    );
    await expect(paragraphs.filter({ hasText: /^CSS wins$/ })).toHaveCount(1);
    await expect(
      paragraphs.filter({ hasText: /^Invalid ignored$/ })
    ).toHaveCount(1);
    await expect
      .poll(async () =>
        Promise.all(
          ['Right aligned', 'CSS wins', 'Invalid ignored'].map(async (text) =>
            paragraphs
              .filter({ hasText: new RegExp(`^${text}$`) })
              .evaluate((node) => (node as HTMLElement).style.textAlign)
          )
        )
      )
      .toEqual(['right', 'center', '']);
  });

  test('normalizes extra newlines from multiline HTML paragraphs', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: MULTILINE_EXTRA_NEWLINES_HTML,
        text: 'Hello\nWorld\nHello   World   !\nHello World !',
      });
    } else {
      await editor.clipboard.pasteHtml(
        MULTILINE_EXTRA_NEWLINES_HTML,
        'Hello\nWorld\nHello   World   !\nHello World !'
      );
    }

    const paragraphs = editor.root.locator('p');
    await expect(paragraphs).toHaveCount(4);
    await expect(paragraphs.nth(0)).toHaveText('Hello', {
      useInnerText: true,
    });
    await expect(paragraphs.nth(1)).toHaveText('World', {
      useInnerText: true,
    });
    await expect(paragraphs.nth(2)).toHaveText('Hello   World   !', {
      useInnerText: true,
    });
    await expect(paragraphs.nth(3)).toHaveText('Hello World !', {
      useInnerText: true,
    });
    await expect(paragraphs.nth(3).locator('strong')).toHaveText('World');
    await expect(paragraphs.nth(3).locator('em')).toHaveText('!');
  });

  test('preserves blank lines from contenteditable-style multiline HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<div>a</div><div><br></div><div>b</div>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'a\n\nb' });
    } else {
      await editor.clipboard.pasteHtml(html, 'a\n\nb');
    }

    await editor.assert.blockTexts(['a', '', 'b']);
    await expect(editor.root.locator('p')).toHaveCount(3);
  });

  test('preserves Google Docs empty paragraphs without extra blank lines', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: GOOGLE_DOCS_EMPTY_PARAGRAPH_HTML,
        text: 'paragraph 1\n\nparagraph 2',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_DOCS_EMPTY_PARAGRAPH_HTML,
        'paragraph 1\n\nparagraph 2'
      );
    }

    await editor.assert.blockTexts(['paragraph 1', '', 'paragraph 2']);
    await expect(editor.root.locator('p')).toHaveCount(3);
    await expect(editor.root.locator('p').nth(1)).toHaveText('');
  });

  test('preserves leading and trailing br-only lines from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<div><br><br><div>CCC</div><div>DDD</div><br><br></div>';
    const text = '\n\nCCC\nDDD\n\n';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.blockTexts(['', '', 'CCC', 'DDD', '', '']);
    await expect(editor.root.locator('p')).toHaveCount(6);
  });

  test('preserves non-collapsible spaces from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p>A&nbsp;&nbsp;&#12288;B</p>';
    const text = 'A\u00A0\u00A0\u3000B';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.text(text);
  });

  test('preserves spaces between adjacent inline mark elements from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p><em>one</em> <strong>two</strong></p>';
    const text = 'one two';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.text(text);
    await expect(editor.root.locator('p').first()).toHaveText(text, {
      useInnerText: true,
    });
    await expect(editor.root.locator('em')).toHaveText('one');
    await expect(editor.root.locator('strong')).toHaveText('two');
  });

  test('imports trailing spaces around inline mark elements from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<p><strong>1 </strong> </p>';
    const text = '1 ';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.text(text);
    await expect(editor.root.locator('strong')).toHaveText('1 ');
  });

  test('imports an anchor element from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: '<a href="https://facebook.com">Facebook!</a>',
        text: 'Facebook!',
      });
    } else {
      await editor.clipboard.pasteHtml(
        '<a href="https://facebook.com">Facebook!</a>',
        'Facebook!'
      );
    }

    await editor.assert.text('Facebook!');

    const link = editor.root.locator('a').filter({ hasText: 'Facebook!' });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', 'https://facebook.com/');
  });

  test('preserves ampersand URL query parameters from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const href =
      'https://blog.example.com/post?utm_source=test&utm_medium=cypress';
    const html = `<p><a href="https://blog.example.com/post?utm_source=test&amp;utm_medium=cypress">a link</a></p>`;

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text: 'a link' });
    } else {
      await editor.clipboard.pasteHtml(html, 'a link');
    }

    await editor.assert.text('a link');

    const link = editor.root.locator('a').filter({ hasText: 'a link' });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('href', href);
  });

  test('keeps a Windows tab title link as one anchor when pasted', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: WINDOWS_TAB_LINK_HTML,
        text: 'foo:bar.pdf',
      });
    } else {
      await editor.clipboard.pasteHtml(WINDOWS_TAB_LINK_HTML, 'foo:bar.pdf');
    }

    await editor.assert.text('foo:bar.pdf');

    const links = editor.root.locator('a');
    await expect(links).toHaveCount(1);
    await expect(links.first()).toHaveText('foo:bar.pdf');
    await expect(links.first()).toHaveAttribute(
      'href',
      'http://localhost/foobar'
    );
  });

  test('sanitizes executable rich HTML paste payloads', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<p><a href="javascript:window.__slatePasteXss=1">unsafe link</a><img alt="" onerror="window.__slatePasteXss=2" src="/test/image.jpg"><script>window.__slatePasteXss=3</script></p>`;

    await page.evaluate(() => {
      (window as typeof window & { __slatePasteXss?: number }).__slatePasteXss =
        0;
    });
    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'unsafe link',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'unsafe link');
    }

    await expect(editor.root).toContainText('unsafe link');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as typeof window & { __slatePasteXss?: number })
              .__slatePasteXss
        )
      )
      .toBe(0);
    await expect(editor.root.locator('script')).toHaveCount(0);
    await expect(editor.root.locator('[onerror]')).toHaveCount(0);

    const link = editor.root.locator('a').filter({ hasText: 'unsafe link' });
    if ((await link.count()) > 0) {
      await expect(link).not.toHaveAttribute('href', /^javascript:/);
    }
  });

  test('sanitizes Word conditional HTML paste junk', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: WORD_COMMENT_HTML,
        text: 'Visible Word text',
      });
    } else {
      await editor.clipboard.pasteHtml(WORD_COMMENT_HTML, 'Visible Word text');
    }

    await editor.assert.blockTexts(['Visible Word text']);
    await expect(editor.root).not.toContainText('OfficeDocumentSettings');
    await expect(editor.root).not.toContainText('StartFragment');
  });

  test('imports noisy link in list HTML without losing the link', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<div>Line 0</div><ul><li><div>Line 1 <a href="https://www.internalfb.com/removed?entry_point=20">Some link</a>.</div></li><li><div>Line 2.</div></li></ul>`;

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'Line 0\nLine 1 Some link.\nLine 2.',
      });
    } else {
      await editor.clipboard.pasteHtml(
        html,
        'Line 0\nLine 1 Some link.\nLine 2.'
      );
    }

    await expect(
      editor.root.locator('p').filter({ hasText: 'Line 0' })
    ).toHaveCount(1);
    await expect(editor.root.locator('ul')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(2);
    await expect(editor.root.locator('li').nth(0)).toContainText(
      'Line 1 Some link.'
    );
    await expect(editor.root.locator('li').nth(1)).toContainText('Line 2.');

    const link = editor.root.locator('li a').filter({ hasText: 'Some link' });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute(
      'href',
      'https://www.internalfb.com/removed?entry_point=20'
    );
  });

  test('imports a basic unordered list from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<ul><li>Hello</li><li>world!</li></ul>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'Hello\nworld!',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'Hello\nworld!');
    }

    await editor.assert.text('Helloworld!');
    await expect(editor.root.locator('ul')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(2);
    await expect(editor.root.locator('li').nth(0)).toHaveText('Hello');
    await expect(editor.root.locator('li').nth(1)).toHaveText('world!');
  });

  test('preserves marks inside implicit pasted list item paragraphs', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<ol><li><em>1</em> <strong>2</strong></li></ol>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: '1 2',
      });
    } else {
      await editor.clipboard.pasteHtml(html, '1 2');
    }

    const item = editor.root.locator('li').first();
    await expect(editor.root.locator('ol')).toHaveCount(1);
    await expect(item.locator('em')).toHaveText('1');
    await expect(item.locator('strong')).toHaveText('2');
  });

  test('does not leak parent list item marks into nested pasted list items', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<ul>
      <li style="font-style: italic">
        Italics
        <ul>
          <li style="font-style: normal; font-weight: 400">Normal</li>
          <li style="font-style: normal; font-weight: 700">Bold</li>
          <li style="font-style: italic; font-weight: 400">Italics</li>
        </ul>
      </li>
      <li style="font-weight: 700">
        Bold
        <ul>
          <li style="font-style: normal; font-weight: 400">Normal</li>
          <li style="font-style: normal; font-weight: 700">Bold</li>
          <li style="font-style: italic; font-weight: 400">Italics</li>
        </ul>
      </li>
    </ul>`;
    const text = 'Italics\nNormal\nBold\nItalics\nBold\nNormal\nBold\nItalics';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    const listItems = editor.root.locator('li');
    await expect(listItems).toHaveCount(8);
    await expect(listItems.nth(1).locator('em')).toHaveCount(0);
    await expect(listItems.nth(1).locator('strong')).toHaveCount(0);
    await expect(listItems.nth(2).locator('em')).toHaveCount(0);
    await expect(listItems.nth(2).locator('strong')).toHaveText('Bold');
    await expect(listItems.nth(3).locator('em')).toHaveText('Italics');
    await expect(listItems.nth(3).locator('strong')).toHaveCount(0);
    await expect(listItems.nth(5).locator('em')).toHaveCount(0);
    await expect(listItems.nth(5).locator('strong')).toHaveCount(0);
    await expect(listItems.nth(6).locator('em')).toHaveCount(0);
    await expect(listItems.nth(6).locator('strong')).toHaveText('Bold');
    await expect(listItems.nth(7).locator('em')).toHaveText('Italics');
    await expect(listItems.nth(7).locator('strong')).toHaveCount(0);
  });

  test('pastes ProseMirror slice list items without runtime errors', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<meta charset="utf-8"><li data-pm-slice="3 3 [&quot;ul&quot;,null,&quot;li&quot;,null]"><p data-dovetail-attrs="{}">o</p></li><li><p data-dovetail-attrs="{}">three</p></li>`;
    const text = 'o\nthree';

    try {
      await editor.selection.selectAll();
      if (testInfo.project.name === 'mobile') {
        await insertDataWithHandle(editor, { html, text });
      } else {
        await editor.clipboard.pasteHtml(html, text);
      }

      runtimeErrors.assertNone();
      await expect(editor.root.locator('ul')).toHaveCount(1);
      await expect(editor.root.locator('li')).toHaveCount(2);
      await expect(editor.root.locator('li').nth(0)).toHaveText('o');
      await expect(editor.root.locator('li').nth(1)).toHaveText('three');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('pastes ProseMirror text slices without exposing slice metadata', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<meta charset="utf-8"><p data-pm-slice="1 1 []">https://example.com</p>`;
    const text = 'https://example.com';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.blockTexts([text]);
    await expect(editor.root.locator('p')).toHaveCount(1);
    await expect(editor.root).not.toContainText('data-pm-slice');
    await expect(editor.root).not.toContainText('meta charset');
  });

  test('pastes ProseMirror table row slices without exposing slice metadata', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<meta charset="utf-8"><table data-pm-slice="2 2 -2 [&quot;table&quot;,null,&quot;tbody&quot;,null]"><tbody><tr><td><p>alpha</p></td><td><p>beta</p></td></tr></tbody></table>`;
    const text = 'alpha\tbeta';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await editor.assert.text('alphabeta');
    await expect(editor.root).not.toContainText('data-pm-slice');
    await expect(editor.root).not.toContainText('meta charset');
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(1);
    await expect(editor.root.locator('td')).toHaveCount(2);
    await expect(editor.root.locator('td').nth(0).locator('p')).toHaveText(
      'alpha'
    );
    await expect(editor.root.locator('td').nth(1).locator('p')).toHaveText(
      'beta'
    );
  });

  test('wraps orphan pasted list items in a list parent', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<li>one</li><li>two</li>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'one\ntwo',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'one\ntwo');
    }

    await expect(editor.root.locator('ul')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(2);
    await expect(editor.root.locator('li').nth(0)).toHaveText('one');
    await expect(editor.root.locator('li').nth(1)).toHaveText('two');
  });

  test('ignores whitespace between pasted list items', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<ul>\n  <li>one</li>\n  \n  <li>two</li>\n</ul>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: 'one\ntwo',
      });
    } else {
      await editor.clipboard.pasteHtml(html, 'one\ntwo');
    }

    await expect(editor.root.locator('ul')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(2);
    await expect(editor.root.locator('li').nth(0)).toHaveText('one');
    await expect(editor.root.locator('li').nth(1)).toHaveText('two');
    await expect(
      editor.root.locator('li').filter({ hasText: /^$/ })
    ).toHaveCount(0);
  });

  test('imports compact nested list variants from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const cases = [
      {
        html: '<ul><li>Hello</li><li><ul><li>awesome</li></ul></li><li>world!</li></ul>',
        text: 'Hello\nawesome\nworld!',
        expectedText: 'Helloawesomeworld!',
      },
      {
        html: '<ul><ul><li>Hello</li></ul><li>world!</li></ul>',
        text: 'Hello\nworld!',
        expectedText: 'Helloworld!',
      },
      {
        html: '<ul><li>Hello<ul><li>world!</li></ul></li></ul>',
        text: 'Hello\nworld!',
        expectedText: 'Helloworld!',
      },
    ];

    for (const listCase of cases) {
      await page.goto('/examples/slate/paste-html');
      const editor = await openExample(page, 'slate/paste-html', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      if (testInfo.project.name === 'mobile') {
        await insertDataWithHandle(editor, {
          html: listCase.html,
          text: listCase.text,
        });
      } else {
        await editor.clipboard.pasteHtml(listCase.html, listCase.text);
      }

      await editor.assert.text(listCase.expectedText);
      await expect(editor.root.locator('ul ul')).toHaveCount(1);
    }
  });

  test('imports nested divs in list items as visible boundaries', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<ol><li>1<div>2</div>3</li><li>A<div>B</div>C</li></ol>';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html,
        text: '1\n2\n3\nA\nB\nC',
      });
    } else {
      await editor.clipboard.pasteHtml(html, '1\n2\n3\nA\nB\nC');
    }

    await expect(editor.root.locator('ol')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(2);
    await expect(editor.root.locator('li').nth(0)).toContainText('1');
    await expect(editor.root.locator('li').nth(0)).toContainText('2');
    await expect(editor.root.locator('li').nth(0)).toContainText('3');
    await expect(editor.root.locator('li').nth(1)).toContainText('A');
    await expect(editor.root.locator('li').nth(1)).toContainText('B');
    await expect(editor.root.locator('li').nth(1)).toContainText('C');
    await expect(editor.root.locator('li').nth(0).locator('p')).toHaveText('2');
    await expect(editor.root.locator('li').nth(1).locator('p')).toHaveText('B');
  });

  test('imports mixed nested ordered and unordered lists from rich HTML paste', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = `<ul>
  <li>abc</li>
  <li>
    xxxx
    <ul>
      <li>girl</li>
      <li>
        <ol>
          <li>hello</li>
          <li>world</li>
        </ol>
      </li>
      <li>women</li>
    </ul>
    human
  </li>
  <li>def</li>
</ul>`;
    const text = 'abc\nxxxx\ngirl\nhello\nworld\nwomen\nhuman\ndef';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html, text });
    } else {
      await editor.clipboard.pasteHtml(html, text);
    }

    await expect(editor.root.locator('ul')).toHaveCount(2);
    await expect(editor.root.locator('ol')).toHaveCount(1);
    await expect(editor.root.locator('li')).toHaveCount(8);
    await editor.assert.text('abcxxxxgirlhelloworldwomenhumandef');
    await expect(editor.root.locator('ol > li').nth(0)).toHaveText('hello');
    await expect(editor.root.locator('ol > li').nth(1)).toHaveText('world');
  });

  test('imports Lexical image HTML with optional captions', async ({
    page,
  }, testInfo) => {
    for (const imageCase of LEXICAL_IMAGE_HTML_CASES) {
      await page.goto('/examples/slate/paste-html');
      const editor = await openExample(page, 'slate/paste-html', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      if (testInfo.project.name === 'mobile') {
        await insertDataWithHandle(editor, imageCase);
      } else {
        await editor.clipboard.pasteHtml(imageCase.html, imageCase.text);
      }

      await expect(editor.root.locator('img')).toHaveCount(1);
      await expect(editor.root.locator('img')).toHaveAttribute(
        'src',
        /\/test\/image\.jpg$/
      );

      if (imageCase.caption) {
        await expect(editor.root.locator('p')).toHaveText(imageCase.caption);
        await expect.poll(() => editor.get.modelText()).toBe(imageCase.caption);
      } else {
        await expect(editor.root.locator('p')).toHaveCount(0);
        await expect.poll(() => editor.get.modelText()).toBe('');
      }
    }
  });

  test('keeps pasted top-level images outside paragraph text', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });
    const html = '<img alt="" src="/test/image.jpg">';

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await editor.insertText('Before after');
    } else {
      await editor.type('Before after');
    }
    await editor.selection.collapse({ path: [0, 0], offset: 'Before '.length });

    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, { html });
    } else {
      await editor.clipboard.pasteHtml(html, '');
    }

    await expect(editor.root.locator('img')).toHaveCount(1);
    await expect(editor.root.locator('p img')).toHaveCount(0);
    await expect
      .poll(async () => (await editor.get.blockTexts()).join(''))
      .toBe('Before after');
  });

  test('imports Google Docs table HTML with cell paragraphs', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: GOOGLE_DOCS_TABLE_HTML,
        text: 'a\tb\nb\tc\nd\te\tf',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_DOCS_TABLE_HTML,
        'a\tb\nb\tc\nd\te\tf'
      );
    }

    await editor.assert.text('abbcdef');
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(2);
    await expect(editor.root.locator('td')).toHaveCount(6);

    const cells = editor.root.locator('td');
    await expect(cells.nth(0).locator('p')).toHaveText('a');
    await expect(cells.nth(1).locator('p')).toHaveText(['b', 'b']);
    await expect(cells.nth(2).locator('p')).toHaveText('c');
    await expect(cells.nth(3).locator('p')).toHaveText('d');
    await expect(cells.nth(4).locator('p')).toHaveText('e');
    await expect(cells.nth(5).locator('p')).toHaveText('f');
    await expect(cells.nth(1).locator('span[style*="font-size"]')).toHaveCount(
      2
    );
    await expectFontSizeCloseTo(
      cells.nth(1).locator('span[style*="font-size"]').first(),
      14.6667
    );
  });

  test('imports Quip table HTML with a cell line break', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: QUIP_TABLE_HTML,
        text: 'a\tb\nb\tc\nd\te\tf',
      });
    } else {
      await editor.clipboard.pasteHtml(QUIP_TABLE_HTML, 'a\tb\nb\tc\nd\te\tf');
    }

    await editor.assert.text('ab\nbcdef');
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(2);
    await expect(editor.root.locator('td')).toHaveCount(6);

    const cells = editor.root.locator('td');
    await expect(cells.nth(0)).toHaveText('a');
    await expect(cells.nth(1)).toHaveText('b b');
    await expect(cells.nth(2)).toHaveText('c');
    await expect(cells.nth(3)).toHaveText('d');
    await expect(cells.nth(4)).toHaveText('e');
    await expect(cells.nth(5)).toHaveText('f');
    await expect
      .poll(async () => cells.nth(1).evaluate((element) => element.textContent))
      .toBe('b\nb');
  });

  test('keeps Word table links scoped to their source cell', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: WORD_TABLE_LINK_HTML,
        text: 'linked\tplain',
      });
    } else {
      await editor.clipboard.pasteHtml(WORD_TABLE_LINK_HTML, 'linked\tplain');
    }

    await expect(editor.root.locator('table')).toHaveCount(1);
    const cells = editor.root.locator('td');

    await expect(cells).toHaveCount(2);
    await expect(cells.nth(0).locator('a')).toHaveText('linked');
    await expect(cells.nth(1).locator('a')).toHaveCount(0);
    await expect(cells.nth(1)).toHaveText('plain');
  });

  test('imports Google Sheets table HTML as table rows and cells', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (
      testInfo.project.name === 'mobile' ||
      testInfo.project.name === 'webkit'
    ) {
      await insertDataWithHandle(editor, {
        html: GOOGLE_SHEETS_TABLE_HTML,
        text: 'Surface\tMWP_WORK_LS_COMPOSER\t77349\nSlate\told editor\tmixed bold',
      });
    } else {
      await editor.clipboard.pasteHtml(
        GOOGLE_SHEETS_TABLE_HTML,
        'Surface\tMWP_WORK_LS_COMPOSER\t77349\nSlate\told editor\tmixed bold'
      );
    }

    await editor.assert.text(
      'SurfaceMWP_WORK_LS_COMPOSER77349Slateold editormixed bold'
    );
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(2);
    await expect(editor.root.locator('td')).toHaveCount(6);
    await expect(editor.root.locator('td').nth(0).locator('strong')).toHaveText(
      'Surface'
    );
    await expect(editor.root.locator('td').nth(1).locator('em')).toHaveText(
      'MWP_WORK_LS_COMPOSER'
    );
    await expect(editor.root.locator('td').nth(2).locator('u')).toHaveText(
      '77349'
    );
    await expect(editor.root.locator('td').nth(4).locator('del')).toHaveText(
      'old editor'
    );
    await expect(editor.root.locator('td').nth(5).locator('strong')).toHaveText(
      'bold'
    );
  });

  test('imports table header cells as plain table cells', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (testInfo.project.name === 'mobile') {
      await insertDataWithHandle(editor, {
        html: HEADER_TABLE_HTML,
        text: 'Animal\tFeet\nCat\t4',
      });
    } else {
      await editor.clipboard.pasteHtml(
        HEADER_TABLE_HTML,
        'Animal\tFeet\nCat\t4'
      );
    }

    await editor.assert.text('AnimalFeetCat4');
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(2);
    await expect(editor.root.locator('td')).toHaveCount(4);
    await expect(editor.root.locator('td').nth(0)).toHaveText('Animal');
    await expect(editor.root.locator('td').nth(1)).toHaveText('Feet');
    await expect(editor.root.locator('td').nth(2)).toHaveText('Cat');
    await expect(editor.root.locator('td').nth(3)).toHaveText('4');
  });

  test('imports only the comment-bounded fragment from wrapped clipboard HTML', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    if (
      testInfo.project.name === 'mobile' ||
      testInfo.project.name === 'webkit'
    ) {
      await insertDataWithHandle(editor, {
        html: COMMENT_BOUNDED_TABLE_HTML,
        text: '123\n456',
      });
    } else {
      await editor.clipboard.pasteHtml(COMMENT_BOUNDED_TABLE_HTML, '123\n456');
    }

    await editor.assert.text('123456');
    await expect(editor.root).not.toContainText('outside before');
    await expect(editor.root).not.toContainText('outside after');
    await expect(editor.root.locator('table')).toHaveCount(1);
    await expect(editor.root.locator('tr')).toHaveCount(2);
    await expect(editor.root.locator('td')).toHaveCount(2);
    await expect(editor.root.locator('td').nth(0).locator('p')).toHaveText(
      '123'
    );
    await expect(editor.root.locator('td').nth(1).locator('p')).toHaveText(
      '456'
    );
  });

  test('runs generated clipboard paste gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop clipboard gauntlet proof'
    );

    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'paste-html-generated-clipboard-gauntlet',
      createSlateBrowserClipboardPasteGauntlet({
        html: '<strong>Hello Bold</strong>',
        plainText: 'Hello Bold',
        textAfterPaste: 'Hello Bold',
      }),
      {
        metadata: {
          capabilities: ['clipboard', 'html-paste', 'kernel-trace'],
          platform: testInfo.project.name,
          transport: 'clipboard',
        },
        tracePath: testInfo.outputPath('paste-html-clipboard-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('desktop-native-clipboard');
    await expect(
      editor.root.locator('strong').filter({ hasText: 'Hello' })
    ).toHaveCount(1);
  });

  test('runs generated drop data gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/paste-html', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'paste-html-generated-drop-data-gauntlet',
      createSlateBrowserDropDataGauntlet({
        html: '<strong>Dropped Bold</strong>',
        plainText: 'Dropped Bold',
        textAfterDrop: 'Dropped Bold',
      }),
      {
        metadata: {
          capabilities: ['drop', 'html-drop', 'kernel-trace'],
          platform: testInfo.project.name,
          transport: 'synthetic-datatransfer-drop',
        },
        tracePath: testInfo.outputPath('paste-html-drop-data-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('synthetic-datatransfer');
    await expect(
      editor.root.locator('strong').filter({ hasText: 'Dropped' })
    ).toHaveCount(1);
  });
});
