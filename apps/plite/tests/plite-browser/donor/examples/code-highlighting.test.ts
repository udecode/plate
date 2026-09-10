import { expect, test } from "@playwright/test";
import {
  openExample,
  recordPliteBrowserRuntimeErrors,
  withExclusiveClipboardAccess,
} from "@platejs/test/playwright";

test.setTimeout(60 * 1000);

const firstCode = `// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const editor = useEditor({
    initialValue,
  })

  return (
    <Plite editor={editor}>
      <Editable />
    </Plite>
  )
}`;

const lineOffset = (text: string, line: number, column = 0) => {
  let offset = 0;

  for (let index = 0; index < line; index++) {
    offset = text.indexOf("\n", offset) + 1;
  }

  return offset + column;
};

test.describe("code highlighting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/examples/plite/code-highlighting");
    await expect(page.getByTestId("code-block-button")).toBeVisible();
  });

  test("renders semantic token projections", async ({ page }) => {
    const editor = page.locator("[data-plite-editor]");

    await expect(editor).toContainText("const initialValue");
    await expect(editor.locator(".token").first()).toBeVisible();
    await expect(editor.locator(".keyword").first()).toBeVisible();
    await expect(editor.locator(".string").first()).toBeVisible();
    await expect(editor.locator(".punctuation").first()).toBeVisible();
  });

  test("updates the code block language through the select", async ({
    page,
  }) => {
    const languageSelect = page.getByTestId("language-select").first();

    await expect(languageSelect).toHaveValue("jsx");

    await languageSelect.selectOption("typescript");

    await expect(languageSelect).toHaveValue("typescript");
  });

  test("retokens edited code after changing the language", async ({ page }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await page.getByTestId("code-block-button").click();
    await page.getByTestId("language-select").first().selectOption("css");
    await editor.insertText("body { color: red; }");

    const codeBlock = editor.root.locator(".plite-code-highlighting-block");

    await expect(
      codeBlock.locator(".selector").filter({ hasText: "body" })
    ).toBeVisible();
    await expect(
      codeBlock.locator(".property").filter({ hasText: "color" })
    ).toBeVisible();
    await expect(
      codeBlock.locator(".punctuation").filter({ hasText: "{" })
    ).toBeVisible();
  });

  test("converts a selected paragraph into one multiline code text", async ({
    page,
  }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    const paragraphText =
      "Here's one containing a single paragraph block with some text in it:";

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: paragraphText.length },
    });
    await editor.focus();
    await page.getByTestId("code-block-button").click();

    await expect(
      editor.root.locator(':scope > [data-plite-node="element"]')
    ).toHaveCount(5);
    await expect(editor.locator.text([0, 0])).toHaveText(paragraphText);
    await expect(
      editor.root
        .locator(':scope > [data-plite-node="element"]')
        .first()
        .getByTestId("language-select")
    ).toHaveValue("html");
    await expect(editor.locator.text([1, 0])).toHaveText(firstCode);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: paragraphText.length },
    });
  });

  test("converts a selected paragraph into a code block with a shortcut", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop shortcut proof");

    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    const paragraphText =
      "Here's one containing a single paragraph block with some text in it:";
    const modifier = await editor.root.evaluate(() =>
      /Mac|iPad|iPhone|iPod/.test(navigator.platform) ||
      /Mac OS X/.test(navigator.userAgent)
        ? "Meta"
        : "Control"
    );

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: paragraphText.length },
    });
    await editor.focus();
    await editor.root.press(`${modifier}+Shift+C`);

    await expect(
      editor.root
        .locator(':scope > [data-plite-node="element"]')
        .first()
        .getByTestId("language-select")
    ).toHaveValue("html");
    await expect(editor.locator.text([0, 0])).toHaveText(paragraphText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: paragraphText.length },
    });
  });

  test("Enter inserts a newline inside the same code block", async ({
    page,
  }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selection.collapse({ path: [1, 0], offset: 6 });
    await editor.focus();
    await editor.press("Enter");

    await expect(
      editor.root.locator(':scope > [data-plite-node="element"]')
    ).toHaveCount(5);
    await expect(editor.locator.text([1, 0])).toHaveText(
      firstCode.replace("// Add the", "// Add\n the")
    );
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 7 },
      focus: { path: [1, 0], offset: 7 },
    });
  });

  test("Enter at a physical line end creates a reachable blank line", async ({
    page,
  }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    const firstLine = "// Add the initial value.";

    await editor.selection.collapse({
      path: [1, 0],
      offset: firstLine.length,
    });
    await editor.focus();
    await editor.press("Enter");

    await expect(editor.locator.text([1, 0])).toHaveText(
      firstCode.replace(`${firstLine}\n`, `${firstLine}\n\n`)
    );
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: firstLine.length + 1 },
      focus: { path: [1, 0], offset: firstLine.length + 1 },
    });

    await editor.insertText("tail");
    await expect(editor.locator.text([1, 0])).toHaveText(
      firstCode.replace(`${firstLine}\n`, `${firstLine}\ntail\n`)
    );
  });

  test("deletes a trailing newline with Backspace", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop code-block proof");

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    try {
      await editor.selection.collapse({
        path: [1, 0],
        offset: firstCode.length,
      });
      await editor.focus();
      await editor.press("Enter");
      await expect(editor.locator.text([1, 0])).toHaveText(`${firstCode}\n`);

      await editor.root.press("Backspace");

      runtimeErrors.assertNone();
      await expect(editor.locator.text([1, 0])).toHaveText(firstCode);
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: firstCode.length },
        focus: { path: [1, 0], offset: firstCode.length },
      });

      await editor.insertText("tail");
      await expect(editor.locator.text([1, 0])).toHaveText(`${firstCode}tail`);
    } finally {
      runtimeErrors.stop();
    }
  });

  test("keeps ArrowDown navigation stable through a single-line code block", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop code-block keyboard navigation proof"
    );

    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    const before = "long line before code block";
    const code = "code";
    const after = "after";

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText(before);
    await editor.insertBreak();
    await editor.insertText(code);
    await editor.insertBreak();
    await editor.insertText(after);
    await editor.selection.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: code.length },
    });
    await page.getByTestId("code-block-button").click();

    await expect(
      editor.root
        .locator(':scope > [data-plite-node="element"]')
        .nth(1)
        .getByTestId("language-select")
    ).toHaveValue("html");
    await editor.selection.collapse({ path: [0, 0], offset: before.length });
    await editor.focus();
    await editor.press("ArrowDown");

    await editor.assert.selection({
      anchor: { path: [1, 0], offset: code.length },
      focus: { path: [1, 0], offset: code.length },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: code.length,
      anchorPath: [1, 0],
      isCollapsed: true,
    });

    await editor.press("ArrowDown");

    await editor.assert.selection({
      anchor: { path: [2, 0], offset: after.length },
      focus: { path: [2, 0], offset: after.length },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: after.length,
      anchorPath: [2, 0],
      isCollapsed: true,
    });
  });

  test("Tab inside code inserts configured spaces and advances the caret", async ({
    page,
  }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selection.collapse({ path: [1, 0], offset: 3 });
    await editor.focus();
    await editor.press("Tab");

    await expect(editor.locator.text([1, 0])).toHaveText(
      firstCode.replace("// Add", "//   Add")
    );
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 5 },
      focus: { path: [1, 0], offset: 5 },
    });
  });

  test("Tab and Shift+Tab indent every selected physical line", async ({
    page,
  }) => {
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selection.select({
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: lineOffset(firstCode, 1, 1) },
    });
    await editor.focus();
    await editor.press("Tab");

    const indentedCode = firstCode.replace(
      "// Add the initial value.\nconst initialValue = [",
      "  // Add the initial value.\n  const initialValue = ["
    );

    await expect(editor.locator.text([1, 0])).toHaveText(indentedCode);

    await editor.selection.select({
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: lineOffset(indentedCode, 1, 3) },
    });
    await editor.press("Shift+Tab");

    await expect(editor.locator.text([1, 0])).toHaveText(firstCode);
  });

  test("ArrowUp keeps code-block selection anchored in text", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop code-block proof");

    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selection.collapse({
      path: [1, 0],
      offset: lineOffset(firstCode, 2, 3),
    });
    await editor.focus();
    await editor.press("ArrowUp");
    await editor.press("ArrowUp");

    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 3 },
    });

    await expect
      .poll(() =>
        page.evaluate(() => {
          const selection = window.getSelection();
          const anchorNode = selection?.anchorNode;
          const anchorElement =
            anchorNode instanceof Element
              ? anchorNode
              : anchorNode?.parentElement;

          return {
            closestPliteNode:
              anchorElement
                ?.closest("[data-plite-node]")
                ?.getAttribute("data-plite-node") ?? null,
            nodeType: anchorNode?.nodeType ?? null,
          };
        })
      )
      .toEqual({
        closestPliteNode: "text",
        nodeType: 3,
      });
  });

  test("replaces a multiline code selection without crashing", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop multi-line code replacement proof"
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    try {
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: lineOffset(firstCode, 13, 2) },
        focus: { path: [1, 0], offset: lineOffset(firstCode, 17, 3) },
      });
      await expect
        .poll(() =>
          page.evaluate(() => window.getSelection()?.toString() ?? "")
        )
        .toContain("return");

      await editor.root.press("a");

      runtimeErrors.assertNone();
      await expect(editor.locator.text([1, 0])).toContainText("a");
      await expect.poll(() => editor.get.modelText()).not.toContain("return (");
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    } finally {
      runtimeErrors.stop();
    }
  });

  test("deletes from a code block into the following paragraph without crashing", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop cross-block delete proof"
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    try {
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: lineOffset(firstCode, 17) },
        focus: { path: [2, 0], offset: "If you are using".length },
      });
      await expect
        .poll(() =>
          page.evaluate(() => window.getSelection()?.toString() ?? "")
        )
        .toContain("If you are using");

      await editor.root.press("Backspace");
      await page.keyboard.type("after");

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.modelText()).toContain("after");
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    } finally {
      runtimeErrors.stop();
    }
  });

  test("keeps multiline code intact at the previous block boundary", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop code-block boundary Backspace proof"
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    try {
      await editor.selection.collapse({ path: [1, 0], offset: 0 });
      await editor.focus();
      await editor.root.press("Backspace");

      runtimeErrors.assertNone();
      await expect(editor.locator.text([1, 0])).toHaveText(firstCode);
    } finally {
      runtimeErrors.stop();
    }
  });

  test("Backspace in an empty code block keeps the editor usable", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop empty code block Backspace proof"
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    try {
      await editor.selectAll();
      await editor.deleteFragment();
      await editor.focus();
      await page.getByTestId("code-block-button").click();
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await editor.root.press("Backspace");
      await page.keyboard.type("after");

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.modelText()).toContain("after");
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    } finally {
      runtimeErrors.stop();
    }
  });

  test("mouse drag undo restores typed selected paragraph text replacement", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop native drag proof");

    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });
    const originalText =
      "If you are using TypeScript, create the editor from the final value shape and pass extension factories at creation time. The example below includes the custom types required for the rest of this example.";
    const selectedText = "using";
    const selectionStart = originalText.indexOf(selectedText);
    const selectionEnd = selectionStart + selectedText.length;

    await editor.selection.dragTextRange({
      endOffset: selectionEnd,
      startOffset: selectionStart,
      text: originalText,
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ""))
      .toBe(selectedText);

    await page.keyboard.type("writing");
    await expect(editor.locator.block([2])).toContainText(
      "If you are writing TypeScript"
    );

    await page.keyboard.press(
      await editor.root.evaluate(() =>
        /Mac|iPad|iPhone|iPod/.test(navigator.platform) ||
        /Mac OS X/.test(navigator.userAgent)
          ? "Meta+Z"
          : "Control+Z"
      )
    );

    await expect(editor.locator.block([2])).toContainText(
      "If you are using TypeScript"
    );
    await editor.assert.selection({
      anchor: { path: [2, 0], offset: selectionStart },
      focus: { path: [2, 0], offset: selectionEnd },
    });
    await expect.poll(() => editor.get.selectedText()).toBe(selectedText);
  });

  test("pastes selected text inside a code block without leaving the code block", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Native clipboard proof needs desktop keyboard shortcuts"
    );

    const editor = await openExample(page, "plite/code-highlighting", {
      ready: {
        editor: "visible",
        text: /const initialValue/,
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [1, 0], offset: 6 },
    });

    await withExclusiveClipboardAccess(async () => {
      await editor.root.press("ControlOrMeta+C");
      await editor.selection.collapse({ path: [1, 0], offset: 0 });
      await editor.root.press("ControlOrMeta+V");
    });

    await expect(
      editor.root.locator(':scope > [data-plite-node="element"]')
    ).toHaveCount(5);
    await expect(editor.locator.text([1, 0])).toHaveText(`Add${firstCode}`);
    await expect(
      editor.root
        .locator(':scope > [data-plite-node="element"]')
        .nth(1)
        .getByTestId("language-select")
    ).toHaveValue("jsx");
  });
});
