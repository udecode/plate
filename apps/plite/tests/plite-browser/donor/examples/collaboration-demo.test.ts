import { expect, type Locator, test } from "@playwright/test";
import { BROWSER_HANDLE_KEY, recordBrowserRuntimeErrors } from "@platejs/test/playwright";

const INITIAL_TEXT =
  "Ada and Lin edit independent documents through a local Yjs room.";

const selectEditorPoint = (editor: Locator, offset: number) =>
  editor.evaluate((element: HTMLElement, [nextOffset, key]) => {
    const handle = (element as Record<string, any>)[key];
    const point = { offset: nextOffset, path: [0, 0] };

    if (!handle?.selectRange) {
      throw new Error("Missing Plite browser handle");
    }

    handle.selectRange({ anchor: point, focus: point });
  }, [offset, BROWSER_HANDLE_KEY] as const);

const selectEditorRange = (editor: Locator, start: number, end: number) =>
  editor.evaluate((element: HTMLElement, [from, to, key]) => {
    const handle = (element as Record<string, any>)[key];

    if (!handle?.selectRange) {
      throw new Error("Missing Plite browser handle");
    }

    handle.selectRange({
      anchor: { offset: from, path: [0, 0] },
      focus: { offset: to, path: [0, 0] },
    });
  }, [start, end, BROWSER_HANDLE_KEY] as const);

const readEditor = (editor: Locator) =>
  editor.evaluate((element: HTMLElement, key) => {
    const handle = (element as Record<string, any>)[key];

    if (!handle?.getBlockTexts || !handle?.getValue) {
      throw new Error("Missing Plite browser handle");
    }

    return {
      blocks: handle.getBlockTexts() as string[],
      children: handle.getValue().children as Array<{
        children: Array<{ bold?: boolean; text?: string }>;
      }>,
    };
  }, BROWSER_HANDLE_KEY);

test.describe("Plate collaboration registry example", () => {
  for (const [edge, arrow, first, second] of [
    ["end", "ArrowRight", "Ada and Lin", " edit independent documents through a local Yjs room."],
    ["start", "ArrowLeft", "Ada and ", "Lin edit independent documents through a local Yjs room."],
  ] as const) {
    test(`Enter at the ${edge} of a bold word splits the line in both peers [plate#5278]`, async ({
      page,
    }) => {
      const runtimeErrors = recordBrowserRuntimeErrors(page);
      const adaEditor = page.getByRole("textbox", {
        name: "Ada collaborative editor",
      });
      const linEditor = page.getByRole("textbox", {
        name: "Lin collaborative editor",
      });
      const readBoth = async () => {
        const [ada, lin] = await Promise.all([
          readEditor(adaEditor),
          readEditor(linEditor),
        ]);

        return {
          ada: ada.blocks,
          lin: lin.blocks,
          same: JSON.stringify(ada.children) === JSON.stringify(lin.children),
        };
      };

      try {
        await page.goto("/examples/plite/collaboration-demo");
        await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

        await selectEditorRange(adaEditor, 8, 11);
        await adaEditor.press("ControlOrMeta+b");
        await expect
          .poll(async () => {
            const [line] = (await readEditor(linEditor)).children;

            return line.children.some(
              (leaf) => leaf.text === "Lin" && leaf.bold === true
            );
          })
          .toBe(true);

        await adaEditor.press(arrow);
        await adaEditor.press("Enter");

        await expect
          .poll(readBoth)
          .toEqual({ ada: [first, second], lin: [first, second], same: true });

        await selectEditorPoint(linEditor, 0);
        await linEditor.type("U");

        await expect
          .poll(readBoth)
          .toEqual({ ada: [`U${first}`, second], lin: [`U${first}`, second], same: true });
        await expect(page.getByText("Collaboration import failed")).toHaveCount(0);

        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  }

  test("Enter mid-word keeps a letter an offline peer typed after the split in the second line", async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const adaEditor = page.getByRole("textbox", {
      name: "Ada collaborative editor",
    });
    const linEditor = page.getByRole("textbox", {
      name: "Lin collaborative editor",
    });
    const linCard = page.locator('[data-peer="lin"]');
    const readBoth = async () => {
      const [ada, lin] = await Promise.all([
        readEditor(adaEditor),
        readEditor(linEditor),
      ]);

      return { ada: ada.blocks, lin: lin.blocks };
    };
    const word = INITIAL_TEXT.indexOf("independent");

    try {
      await page.goto("/examples/plite/collaboration-demo");
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

      await linCard.getByRole("button", { name: "Disconnect" }).click();
      await expect(linCard.locator("[data-peer-status]")).toHaveAttribute(
        "data-peer-status",
        "disconnected"
      );

      await selectEditorPoint(adaEditor, word + 5);
      await adaEditor.press("Enter");
      await selectEditorPoint(linEditor, word + 7);
      await linEditor.type("X");

      await linCard.getByRole("button", { name: "Reconnect" }).click();

      const lines = [
        INITIAL_TEXT.slice(0, word + 5),
        `${INITIAL_TEXT.slice(word + 5, word + 7)}X${INITIAL_TEXT.slice(word + 7)}`,
      ];

      await expect.poll(readBoth).toEqual({ ada: lines, lin: lines });
      await expect(page.getByText("Collaboration import failed")).toHaveCount(0);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("proves independent peers, cursors, reconnect, history, schema, and teardown", async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const adaEditor = page.getByRole("textbox", {
      name: "Ada collaborative editor",
    });
    const linEditor = page.getByRole("textbox", {
      name: "Lin collaborative editor",
    });
    const linCard = page.locator('[data-peer="lin"]');
    const readDocuments = () =>
      Promise.all([adaEditor.innerText(), linEditor.innerText()]);

    try {
      await page.goto("/examples/plite/collaboration-demo");

      await expect(page.locator("[data-collaboration-demo]")).toHaveAttribute(
        "data-editor-count",
        "2"
      );
      await expect(page.locator("[data-collaboration-demo]")).toHaveAttribute(
        "data-provider-count",
        "2"
      );
      await expect(page.locator("[data-collaboration-demo]")).toHaveAttribute(
        "data-doc-count",
        "3"
      );
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

      await selectEditorPoint(adaEditor, INITIAL_TEXT.length);
      await adaEditor.type("!");

      await expect
        .poll(readDocuments)
        .toEqual([`${INITIAL_TEXT}!`, `${INITIAL_TEXT}!`]);
      await expect(
        page.locator('[data-remote-caret][data-client-id="101"]')
      ).toHaveCount(1);
      await expect(page.locator("[data-remote-caret]")).toHaveCount(1);

      await adaEditor.press("Shift+ArrowLeft");
      const remoteSelection = page.locator(
        '[data-remote-selection][data-client-id="101"]'
      );

      await expect(remoteSelection).toHaveCount(1);
      await expect(remoteSelection).toHaveCSS(
        "background-color",
        "rgba(124, 58, 237, 0.2)"
      );
      expect((await remoteSelection.boundingBox())?.width).toBeGreaterThan(0);

      await linCard.getByRole("button", { name: "Disconnect" }).click();
      await expect(linCard.locator("[data-peer-status]")).toHaveAttribute(
        "data-peer-status",
        "disconnected"
      );

      await selectEditorPoint(linEditor, INITIAL_TEXT.length + 1);
      await linEditor.type("L");
      await selectEditorPoint(adaEditor, 0);
      await adaEditor.type("A");

      await expect(adaEditor).toHaveText(`A${INITIAL_TEXT}!`);
      await expect(linEditor).toHaveText(`${INITIAL_TEXT}!L`);
      await expect(page.locator("[data-remote-caret]")).toHaveCount(0);

      await linCard.getByRole("button", { name: "Reconnect" }).click();
      await expect
        .poll(readDocuments)
        .toEqual([`A${INITIAL_TEXT}!L`, `A${INITIAL_TEXT}!L`]);
      await expect(linCard.locator("[data-peer-status]")).toHaveAttribute(
        "data-peer-status",
        "connected"
      );

      await linCard.getByRole("button", { name: "Undo Lin" }).click();
      await expect
        .poll(readDocuments)
        .toEqual([`A${INITIAL_TEXT}!`, `A${INITIAL_TEXT}!`]);
      await expect(
        linCard.getByRole("button", { name: "Redo Lin" })
      ).toContainText("Redo 1");

      await page.getByRole("button", { name: "Reject schema v2" }).click();
      await expect(page.locator("[data-schema-status]")).toHaveAttribute(
        "data-schema-status",
        "rejected"
      );
      await expect(page.locator("[data-schema-status]")).toContainText(
        "local version 2, room version 1"
      );

      await page
        .getByRole("button", { name: "Recover with schema v1" })
        .click();
      await expect(page.locator("[data-schema-status]")).toHaveAttribute(
        "data-schema-status",
        "recovered"
      );
      await expect(page.locator('[contenteditable="true"]')).toHaveCount(2);

      await selectEditorPoint(adaEditor, INITIAL_TEXT.length + 2);
      await page.setViewportSize({ height: 844, width: 390 });

      const cardLocator = page.locator("[data-peer]");

      await expect(cardLocator).toHaveCount(2);

      const cards = await cardLocator.all();
      const [adaCardBox, linCardBox] = await Promise.all(
        cards.map((card) => card.boundingBox())
      );
      const root = page.locator("[data-collaboration-demo]");
      const remoteCaret = page.locator(
        '[data-remote-caret][data-client-id="101"]'
      );
      const remoteLabel = remoteCaret.locator("[data-remote-cursor-label]");
      const linOverlay = linCard.locator("[data-remote-cursor-overlay]");
      const readOverlayBoxes = () =>
        Promise.all([
          remoteCaret.boundingBox(),
          remoteLabel.boundingBox(),
          linOverlay.boundingBox(),
        ]);
      let previousCaretPosition: { x: number; y: number } | null = null;

      await expect
        .poll(async () => {
          const [caret, label, overlay] = await readOverlayBoxes();

          if (!caret || !label || !overlay) return false;

          const overlayRight = overlay.x + overlay.width;
          const caretIsStable =
            previousCaretPosition !== null &&
            Math.abs(caret.x - previousCaretPosition.x) < 0.5 &&
            Math.abs(caret.y - previousCaretPosition.y) < 0.5;

          previousCaretPosition = { x: caret.x, y: caret.y };

          return (
            caretIsStable &&
            caret.x >= overlay.x &&
            caret.x <= overlayRight &&
            label.x >= overlay.x &&
            label.x + label.width <= overlayRight
          );
        })
        .toBe(true);

      const [caretBeforeScroll, labelBeforeScroll, overlayBeforeScroll] =
        await readOverlayBoxes();
      const scrollYBefore = await page.evaluate(() => window.scrollY);
      const rootSize = await root.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));

      expect(adaCardBox?.x).toBeGreaterThanOrEqual(0);
      expect(
        (adaCardBox?.x ?? -1) + (adaCardBox?.width ?? 391)
      ).toBeLessThanOrEqual(390);
      expect(
        (linCardBox?.x ?? -1) + (linCardBox?.width ?? 391)
      ).toBeLessThanOrEqual(390);
      expect(linCardBox?.y).toBeGreaterThan(
        adaCardBox?.y ?? Number.POSITIVE_INFINITY
      );
      expect(rootSize.clientWidth).toBeGreaterThan(0);
      expect(rootSize.scrollWidth).toBe(rootSize.clientWidth);
      expect(caretBeforeScroll).not.toBeNull();
      expect(overlayBeforeScroll).not.toBeNull();
      expect(caretBeforeScroll?.x).toBeGreaterThanOrEqual(
        overlayBeforeScroll?.x ?? Number.POSITIVE_INFINITY
      );
      expect(
        caretBeforeScroll?.x ?? Number.POSITIVE_INFINITY
      ).toBeLessThanOrEqual(
        (overlayBeforeScroll?.x ?? -1) + (overlayBeforeScroll?.width ?? 0)
      );
      expect(labelBeforeScroll?.x).toBeGreaterThanOrEqual(
        overlayBeforeScroll?.x ?? Number.POSITIVE_INFINITY
      );
      expect(
        (labelBeforeScroll?.x ?? 391) + (labelBeforeScroll?.width ?? 0)
      ).toBeLessThanOrEqual(
        (overlayBeforeScroll?.x ?? -1) + (overlayBeforeScroll?.width ?? 0)
      );

      await page.evaluate(() => {
        const scrollingElement = document.scrollingElement;
        const maxScrollY = Math.max(
          0,
          (scrollingElement?.scrollHeight ?? 0) - window.innerHeight
        );
        const targetY =
          window.scrollY < maxScrollY / 2
            ? Math.min(maxScrollY, window.scrollY + 200)
            : Math.max(0, window.scrollY - 200);

        window.scrollTo(0, targetY);
      });

      await expect
        .poll(async () => {
          const caretAfterScroll = await remoteCaret.boundingBox();
          const overlayAfterScroll = await linOverlay.boundingBox();
          const scrollYAfter = await page.evaluate(() => window.scrollY);

          if (
            !caretAfterScroll ||
            !caretBeforeScroll ||
            !overlayAfterScroll ||
            !overlayBeforeScroll ||
            Math.abs(scrollYAfter - scrollYBefore) < 1
          ) {
            return false;
          }

          const scrollDelta = scrollYAfter - scrollYBefore;

          return (
            Math.abs(caretAfterScroll.x - caretBeforeScroll.x) < 0.5 &&
            Math.abs(caretAfterScroll.y - (caretBeforeScroll.y - scrollDelta)) <
              0.5 &&
            Math.abs(overlayAfterScroll.x - overlayBeforeScroll.x) < 0.5 &&
            Math.abs(overlayAfterScroll.y - overlayBeforeScroll.y) < 0.5
          );
        })
        .toBe(true);

      await page.goto("/examples/plite/plaintext");
      await expect(
        page.locator('[data-editor-example="plaintext"]')
      ).toBeVisible();

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
