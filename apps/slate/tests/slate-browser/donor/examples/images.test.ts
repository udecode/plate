import { expect, type Locator, test } from "@playwright/test";
import {
  installSlateReactRenderProfiler,
  openExample,
  recordSlateBrowserRuntimeErrors,
  resetSlateReactRenderProfiler,
  takeSlateBrowserRenderStateSnapshot,
} from "@platejs/browser/playwright";

type BlockDropCursorEdge = "bottom" | "top";

type ElementBoxSnapshot = {
  height: number;
  width: number;
  x: number;
  y: number;
};

const firstExampleImageUrl = "https://picsum.photos/id/1015/160/90.jpg";
const secondExampleImageUrl = "https://picsum.photos/id/1025/160/90.jpg";
const thirdExampleImageUrl = "https://picsum.photos/id/1069/160/90.jpg";

const dispatchImageDragOver = async (
  image: Locator,
  verticalEdge: BlockDropCursorEdge
) =>
  image.evaluate((element, edge) => {
    const rect = element.getBoundingClientRect();
    const data = new DataTransfer();
    const clientY = edge === "top" ? rect.top + 2 : rect.bottom - 2;

    data.setData("text/plain", "dragged text");
    element.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY,
        dataTransfer: data,
      })
    );
  }, verticalEdge);

const getClosestImageVoidBox = async (
  image: Locator
): Promise<ElementBoxSnapshot | null> =>
  image.evaluate((element) => {
    const rect = element
      .closest('[data-slate-void="true"]')
      ?.getBoundingClientRect();

    if (!rect) {
      return null;
    }

    return {
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y,
    };
  });

const expectImageDropCursorAligned = async ({
  cursor,
  image,
  verticalEdge,
}: {
  cursor: Locator;
  image: Locator;
  verticalEdge: BlockDropCursorEdge;
}) => {
  await expect(cursor).toBeVisible();

  const [cursorBox, voidBox] = await Promise.all([
    cursor.boundingBox(),
    getClosestImageVoidBox(image),
  ]);

  if (!cursorBox || !voidBox) {
    throw new Error("Expected image drop cursor and void boxes");
  }

  const cursorMidlineY = cursorBox.y + cursorBox.height / 2;
  const expectedY =
    verticalEdge === "top" ? voidBox.y : voidBox.y + voidBox.height;

  expect(Math.abs(cursorBox.x - voidBox.x)).toBeLessThanOrEqual(3);
  expect(Math.abs(cursorMidlineY - expectedY)).toBeLessThanOrEqual(3);
  expect(cursorBox.width).toBeGreaterThan(voidBox.width * 0.8);
};

test.describe("images example", () => {
  test.beforeEach(async ({ page }) => {
    await installSlateReactRenderProfiler(page);
    await page.goto("/examples/slate/images");
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("contains image", async ({ page }) => {
    await expect(page.getByRole("textbox").locator("img")).toHaveCount(2);
  });

  test("does not insert invalid image URL from prompt", async ({ page }) => {
    page.on("dialog", async (dialog) => {
      if (dialog.type() === "prompt") {
        await dialog.accept("https://example.com/not-an-image.txt");
        return;
      }

      await dialog.accept();
    });

    await page.getByRole("button", { name: "Image" }).click();

    await expect(page.getByRole("textbox").locator("img")).toHaveCount(2);
  });

  test("pastes image files from clipboard data", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "firefox",
      "Firefox synthetic ClipboardEvent file data does not insert an image"
    );

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.selection.collapse({ path: [2, 0], offset: 0 });
    await editor.root.evaluate((element: HTMLElement) => {
      const data = new DataTransfer();
      const file = new File(["not-real-image-bytes"], "pasted.png", {
        type: "image/png",
      });

      data.items.add(file);
      element.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: data,
        })
      );
    });

    await expect(editor.root.locator("img")).toHaveCount(3);
    await expect(
      editor.root.locator('img[src^="data:image/png;base64,"]')
    ).toHaveCount(1);
  });

  test("deletes selected image", async ({ page }) => {
    const editor = page.getByRole("textbox");
    const firstImage = editor.locator("img").first();

    await firstImage.click();
    await page.getByRole("button", { name: "delete" }).click();

    await expect(editor.locator("img")).toHaveCount(1);
  });

  test("deletes a clicked selected image with Backspace", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "firefox" || testInfo.project.name === "mobile",
      "Chromium/WebKit vertical image ArrowDown proof; Firefox moves after the image to [2,0] offset 20"
    );

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.root.locator("img").first().click();
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

    await page.keyboard.press("Backspace");

    await expect(editor.root.locator("img")).toHaveCount(1);
  });

  test("keeps rapid image clicks selecting the latest void node", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop rapid node-selection proof"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });
      const images = editor.root.locator("img");
      const expectImageSelection = async (blockIndex: number) => {
        const path = [blockIndex, 0];

        await expect
          .poll(() => editor.selection.get())
          .toEqual({
            anchor: { path, offset: 0 },
            focus: { path, offset: 0 },
          });
        await editor.assert.domSelectionTarget({
          anchorOffset: 0,
          anchorPath: path,
          isCollapsed: true,
        });
        await editor.assert.noDoubleSelectionHighlight();
      };

      await expect(images).toHaveCount(3);

      for (const imageIndex of [0, 1, 2, 0, 2]) {
        await images.nth(imageIndex).click();
      }

      await expectImageSelection(3);

      for (const [imageIndex, blockIndex] of [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 2],
      ] as const) {
        await images.nth(imageIndex).click();
        await expectImageSelection(blockIndex);
      }

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("selects an image after outside blur and repeated block clicks", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop blurred node-selection proof"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });
      const images = editor.root.locator("img");
      const clickOutsideEditor = async () => {
        const box = await editor.root.boundingBox();

        if (!box) {
          throw new Error("Expected images editor to have a bounding box");
        }

        await page.mouse.click(
          Math.max(1, box.x - 12),
          Math.max(1, box.y - 12)
        );
      };

      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await clickOutsideEditor();
      await expect
        .poll(async () => (await editor.get.focusOwner()).kind)
        .not.toBe("editor");

      await expect(images).toHaveCount(3);
      await images.first().click();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: [1, 0],
        isCollapsed: true,
      });
      await editor.assert.noDoubleSelectionHighlight();

      await clickOutsideEditor();
      for (const imageIndex of [1, 2, 0, 2]) {
        await images.nth(imageIndex).click();
      }
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [3, 0], offset: 0 },
          focus: { path: [3, 0], offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: [3, 0],
        isCollapsed: true,
      });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("selects the lower adjacent image after dragging from a cursor below the void group", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop adjacent block-void drag selection proof"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });
      const images = editor.root.locator("img");
      const bottomImage = images.nth(2);

      await expect(images).toHaveCount(3);
      await expect(bottomImage).toBeVisible();
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([
          "Before adjacent images.",
          "",
          "",
          "",
          "After adjacent images.",
        ]);
      const boxes = await images.evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();

          return { bottom: rect.bottom, top: rect.top };
        })
      );

      expect(boxes[2]?.top).toBeGreaterThan(boxes[1]?.top ?? 0);

      await editor.selection.selectDOM({
        anchor: { path: [4, 0], offset: "After adjacent images.".length },
        focus: { path: [4, 0], offset: "After adjacent images.".length },
      });
      await editor.assert.domSelectionTarget({
        anchorOffset: "After adjacent images.".length,
        anchorPath: [4, 0],
        isCollapsed: true,
      });

      await bottomImage.scrollIntoViewIfNeeded();
      const box = await bottomImage.boundingBox();

      if (!box) {
        throw new Error("Expected lower adjacent image box");
      }

      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      const dragStartPath = await page.evaluate(
        ({ x, y }) =>
          document
            .elementFromPoint(x, y)
            ?.closest("[data-slate-node]")
            ?.getAttribute("data-slate-path"),
        { x, y }
      );

      expect(dragStartPath).toBe("3");

      await page.mouse.move(x, y);
      await page.mouse.down();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [3, 0], offset: 0 },
          focus: { path: [3, 0], offset: 0 },
        });
      await page.mouse.move(x + 8, y + 8);
      await page.mouse.up();

      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [3, 0], offset: 0 },
          focus: { path: [3, 0], offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: [3, 0],
        isCollapsed: true,
      });
      await editor.assert.noDoubleSelectionHighlight();
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([
          "Before adjacent images.",
          "",
          "",
          "",
          "After adjacent images.",
        ]);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("shows a drop cursor when dragging over an image void", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop dragover visual proof"
    );
    test.skip(
      testInfo.project.name === "firefox",
      "Firefox synthetic DragEvent drop-cursor proof is not stable"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });
      await expect(editor.root.locator("img")).toHaveCount(3);
      await expect(editor.root).toContainText("Before adjacent images.");
      await expect
        .poll(() => editor.get.modelText())
        .toBe("Before adjacent images.After adjacent images.");
      const image = editor.root.locator("img").nth(1);
      const cursor = editor.root.locator("[data-slate-drop-cursor]");

      await dispatchImageDragOver(image, "top");
      await expectImageDropCursorAligned({
        cursor,
        image,
        verticalEdge: "top",
      });

      await dispatchImageDragOver(image, "bottom");
      await expectImageDropCursorAligned({
        cursor,
        image,
        verticalEdge: "bottom",
      });

      await image.evaluate((element) => {
        element.dispatchEvent(
          new DragEvent("dragend", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      await expect(cursor).toHaveCount(0);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("positions the image drop cursor inside a transformed editor", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop CSS transform drop-cursor proof"
    );
    test.skip(
      testInfo.project.name === "firefox",
      "Firefox synthetic DragEvent drop-cursor proof is not stable"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });
      await expect(editor.root.locator("img")).toHaveCount(3);
      await expect(editor.root).toContainText("Before adjacent images.");
      await expect
        .poll(() => editor.get.modelText())
        .toBe("Before adjacent images.After adjacent images.");

      await editor.root.evaluate((element) => {
        element.style.transform = "translate(31px, 17px) scale(1.25)";
        element.style.transformOrigin = "top left";
      });

      const image = editor.root.locator("img").nth(1);
      const cursor = editor.root.locator("[data-slate-drop-cursor]");

      await dispatchImageDragOver(image, "top");
      await expectImageDropCursorAligned({
        cursor,
        image,
        verticalEdge: "top",
      });

      await dispatchImageDragOver(image, "bottom");
      await expectImageDropCursorAligned({
        cursor,
        image,
        verticalEdge: "bottom",
      });

      await image.evaluate((element) => {
        element.dispatchEvent(
          new DragEvent("dragend", {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer(),
          })
        );
      });

      await expect(cursor).toHaveCount(0);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("moves an image void through internal drag and drop", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop internal image drag/drop proof"
    );
    test.skip(
      testInfo.project.name === "firefox",
      "Firefox synthetic DragEvent reorder proof is not stable"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    try {
      const editor = await openExample(page, "slate/images", {
        query: { case: "adjacent-voids" },
        ready: {
          editor: "visible",
          text: "Before adjacent images.",
        },
      });

      await expect(editor.root.locator("img")).toHaveCount(3);
      await expect(editor.root).toContainText("Before adjacent images.");
      await expect
        .poll(() => editor.get.modelText())
        .toBe("Before adjacent images.After adjacent images.");

      const imageUrls = () =>
        editor.root
          .locator("img")
          .evaluateAll((images) =>
            images.map((image) => (image as HTMLImageElement).src)
          );

      await expect
        .poll(imageUrls)
        .toEqual([
          firstExampleImageUrl,
          secondExampleImageUrl,
          thirdExampleImageUrl,
        ]);

      const payloadTypes = await editor.root.evaluate(() => {
        const images = document
          .querySelector('[data-slate-editor="true"]')
          ?.querySelectorAll("img");

        if (!images || images.length < 3) {
          throw new Error("Expected adjacent image voids");
        }

        const firstImage = images[0]!;
        const thirdImage = images[2]!;
        const dragData = new DataTransfer();
        const firstRect = firstImage.getBoundingClientRect();
        const thirdRect = thirdImage.getBoundingClientRect();

        firstImage.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: firstRect.left + 2,
            clientY: firstRect.top + 2,
          })
        );
        firstImage.dispatchEvent(
          new DragEvent("dragstart", {
            bubbles: true,
            cancelable: true,
            clientX: firstRect.left + 2,
            clientY: firstRect.top + 2,
            dataTransfer: dragData,
          })
        );
        thirdImage.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            clientX: thirdRect.left + thirdRect.width / 2,
            clientY: thirdRect.bottom - 1,
            dataTransfer: dragData,
          })
        );
        thirdImage.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            clientX: thirdRect.left + thirdRect.width / 2,
            clientY: thirdRect.bottom - 1,
            dataTransfer: dragData,
          })
        );
        firstImage.dispatchEvent(
          new DragEvent("dragend", {
            bubbles: true,
            cancelable: true,
            clientX: thirdRect.left + thirdRect.width / 2,
            clientY: thirdRect.bottom - 1,
            dataTransfer: dragData,
          })
        );

        return [...dragData.types];
      });

      expect(payloadTypes).toContain("application/x-slate-fragment");
      await expect
        .poll(imageUrls)
        .toEqual([
          secondExampleImageUrl,
          thirdExampleImageUrl,
          firstExampleImageUrl,
        ]);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [3, 0], offset: 0 },
          focus: { path: [3, 0], offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: [3, 0],
        isCollapsed: true,
      });
      await expect(editor.root.locator("[data-slate-drop-cursor]")).toHaveCount(
        0
      );
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("moves a selected image void to a paragraph boundary instead of splitting text", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Desktop node-selection drag/drop proof"
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const introText =
      "In addition to nodes that contain editable text, you can also create other types of nodes, like images or videos.";
    const targetText =
      "This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!";
    const trailingText =
      "You can delete images with the cross in the top left. Try deleting this image:";

    try {
      const editor = await openExample(page, "slate/images", {
        ready: {
          editor: "visible",
        },
      });

      await expect(editor.root.locator("img")).toHaveCount(2);
      await expect(editor.root).toContainText(targetText);
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([introText, "", targetText, trailingText, ""]);

      const payloadTypes = await editor.root.evaluate((root, text) => {
        const firstImage = root.querySelector("img");
        const targetParagraph = Array.from(
          root.querySelectorAll<HTMLElement>('[data-slate-node="element"]')
        ).find((element) => element.textContent === text);

        if (!firstImage || !targetParagraph) {
          throw new Error("Expected image and target paragraph");
        }

        const dragData = new DataTransfer();
        const imageRect = firstImage.getBoundingClientRect();
        const paragraphRect = targetParagraph.getBoundingClientRect();
        const dropX = paragraphRect.left + paragraphRect.width / 2;
        const dropY = paragraphRect.top + paragraphRect.height * 0.75;

        firstImage.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: imageRect.left + 2,
            clientY: imageRect.top + 2,
          })
        );
        firstImage.dispatchEvent(
          new DragEvent("dragstart", {
            bubbles: true,
            cancelable: true,
            clientX: imageRect.left + 2,
            clientY: imageRect.top + 2,
            dataTransfer: dragData,
          })
        );
        targetParagraph.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );
        targetParagraph.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );
        firstImage.dispatchEvent(
          new DragEvent("dragend", {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );

        return [...dragData.types];
      }, targetText);

      expect(payloadTypes).toContain("application/x-slate-fragment");
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([introText, targetText, "", trailingText, ""]);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [2, 0], offset: 0 },
          focus: { path: [2, 0], offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: [2, 0],
        isCollapsed: true,
      });
      await expect(editor.root.locator("[data-slate-drop-cursor]")).toHaveCount(
        0
      );
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("removes an empty paragraph after an image before deleting the image", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "firefox" || testInfo.project.name === "mobile",
      "Chromium/WebKit vertical image ArrowDown proof; Firefox moves after the image to [2,0] offset 20"
    );

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });
    const paragraphAfterImage =
      "This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!";

    await editor.selection.selectDOM({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    await page.keyboard.press("Enter");
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [3, 0], offset: 0 },
        focus: { path: [3, 0], offset: 0 },
      });
    await editor.selection.select({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });

    await page.keyboard.press("Backspace");

    await expect(editor.root.locator("img")).toHaveCount(2);
    await expect(editor.root).toContainText(paragraphAfterImage);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await expect
      .poll(() =>
        editor.root
          .locator("img")
          .first()
          .evaluate((element) => getComputedStyle(element).boxShadow)
      )
      .not.toBe("none");
  });

  test("keeps the previous image when Delete removes following text", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });
    const paragraphAfterImage =
      "This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!";

    await editor.selection.selectDOM({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    await page.keyboard.press("Delete");

    await expect(editor.root.locator("img")).toHaveCount(2);
    await expect(editor.root).toContainText(paragraphAfterImage.slice(1));
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
  });

  test("inserts a paragraph after a clicked selected image on Enter", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.root.locator("img").first().click();
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

    await page.keyboard.press("Enter");
    await page.keyboard.type("after image");

    await expect.poll(() => editor.get.blockTexts()).toContain("after image");
    await editor.assert.domCaret({
      offset: "after image".length,
      text: "after image",
    });
  });

  test("inserts a paragraph after a clicked selected image on Shift+Enter", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    try {
      await editor.root.locator("img").first().click();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });

      await page.keyboard.press("Shift+Enter");
      await page.keyboard.type("after shifted image");

      runtimeErrors.assertNone();
      await expect
        .poll(() => editor.get.blockTexts())
        .toContain("after shifted image");
      await editor.assert.domCaret({
        offset: "after shifted image".length,
        text: "after shifted image",
      });
      await editor.assert.noDoubleSelectionHighlight();
    } finally {
      runtimeErrors.stop();
    }
  });

  test("copies selected image with visible external HTML payload", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "webkit" || testInfo.project.name === "mobile",
      "Chromium/Firefox native clipboard.read HTML payload proof; WebKit blocks navigator.clipboard.read() in Playwright"
    );

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.root.locator("img").first().click();
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

    const payload = await editor.clipboard.copyPayload();

    expect(payload.types).toContain("text/html");
    expect(payload.html).toContain("data-slate-fragment=");
    expect(payload.html).toContain("<img");
    expect(payload.html).toContain(firstExampleImageUrl);
    expect(payload.text).not.toContain("\uFEFF");
  });

  test("selects image editor text content from text focus with keyboard select all", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });
    const expectedSelectedLines = await editor.root
      .locator("p")
      .allTextContents();

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 10 },
    });

    await page.keyboard.press("ControlOrMeta+A");

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        if (!selection) {
          return false;
        }

        const points = [selection.anchor, selection.focus].map((point) => ({
          offset: point.offset,
          path: point.path.join(","),
        }));
        const hasTextStart = points.some(
          (point) => point.path === "0,0" && point.offset === 0
        );
        const hasTextOrVoidEnd = points.some(
          (point) =>
            (point.path === "3,0" && point.offset === 78) ||
            (point.path === "4,0" && point.offset === 0)
        );

        return hasTextStart && hasTextOrVoidEnd;
      })
      .toBe(true);
    await expect
      .poll(async () =>
        (await editor.get.selectedText())
          .split("\n")
          .filter((line) => line.length > 0)
      )
      .toEqual(expectedSelectedLines);
    await expect
      .poll(() =>
        editor.root
          .locator("img")
          .evaluateAll((elements) =>
            elements.map((element) => getComputedStyle(element).boxShadow)
          )
      )
      .toEqual(["none", "none"]);
  });

  test("keeps select-all and document-edge navigation synchronized with edge images", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      query: { case: "edge-voids" },
      ready: {
        editor: "visible",
        text: "Between edge images.",
      },
    });
    const isMacBrowser = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
    );
    const selectAllHotkey = isMacBrowser ? "Meta+a" : "Control+a";
    const documentStartHotkey = isMacBrowser ? "Meta+ArrowUp" : "Control+Home";
    const documentEndHotkey = isMacBrowser ? "Meta+ArrowDown" : "Control+End";

    await expect(editor.root.locator("img")).toHaveCount(2);
    await expect
      .poll(() => editor.get.modelBlockTexts())
      .toEqual(["", "Between edge images.", ""]);

    await editor.selection.selectDOM({
      anchor: { path: [1, 0], offset: 8 },
      focus: { path: [1, 0], offset: 8 },
    });
    await page.keyboard.press(selectAllHotkey);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        if (!selection) {
          return false;
        }

        const points = [selection.anchor, selection.focus].map((point) => ({
          offset: point.offset,
          path: point.path.join(","),
        }));

        return (
          points.some((point) => point.path === "0,0" && point.offset === 0) &&
          points.some((point) => point.path === "2,0" && point.offset === 0)
        );
      })
      .toBe(true);
    await expect
      .poll(async () => (await editor.get.selectedText()).trim())
      .toBe("Between edge images.");
    await editor.assert.noDoubleSelectionHighlight();

    await editor.selection.selectDOM({
      anchor: { path: [1, 0], offset: 8 },
      focus: { path: [1, 0], offset: 8 },
    });
    await page.keyboard.press(documentStartHotkey);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [0, 0],
      isCollapsed: true,
    });

    await editor.selection.selectDOM({
      anchor: { path: [1, 0], offset: 8 },
      focus: { path: [1, 0], offset: 8 },
    });
    await page.keyboard.press(documentEndHotkey);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [2, 0],
      isCollapsed: true,
    });
  });

  test("navigates through adjacent image voids after selecting one", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      query: { case: "adjacent-voids" },
      ready: {
        editor: "visible",
        text: "Before adjacent images.",
      },
    });

    await expect(editor.root.locator("img")).toHaveCount(3);
    await expect
      .poll(() => editor.get.modelBlockTexts())
      .toEqual([
        "Before adjacent images.",
        "",
        "",
        "",
        "After adjacent images.",
      ]);

    const initialScroll = await page.evaluate(() => ({
      x: window.scrollX,
      y: window.scrollY,
    }));

    await editor.root.locator("img").first().click();
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [1, 0],
      isCollapsed: true,
    });
    await editor.assert.noDoubleSelectionHighlight();

    for (const path of [
      [2, 0],
      [3, 0],
      [4, 0],
    ]) {
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path, offset: 0 },
          focus: { path, offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: path,
        isCollapsed: true,
      });
      await editor.assert.noDoubleSelectionHighlight();
    }

    for (const path of [
      [3, 0],
      [2, 0],
      [1, 0],
    ]) {
      await page.keyboard.press("ArrowLeft");
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path, offset: 0 },
          focus: { path, offset: 0 },
        });
      await editor.assert.domSelectionTarget({
        anchorOffset: 0,
        anchorPath: path,
        isCollapsed: true,
      });
      await editor.assert.noDoubleSelectionHighlight();
    }

    await expect
      .poll(() =>
        page.evaluate(() => ({
          x: window.scrollX,
          y: window.scrollY,
        }))
      )
      .toEqual(initialScroll);
  });

  test("does not let the image void spacer add visible space above image content", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 113 },
      focus: { path: [0, 0], offset: 113 },
    });
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

    const contentOffset = await editor.root.evaluate(() => {
      const imageNode = document.querySelector('[data-slate-path="1"]');
      const content = imageNode?.querySelector('[contenteditable="false"]');

      if (!(imageNode instanceof HTMLElement) || !content) {
        throw new Error("Expected selected image node and visible content");
      }

      return (
        content.getBoundingClientRect().top -
        imageNode.getBoundingClientRect().top
      );
    });

    expect(contentOffset).toBeGreaterThanOrEqual(0);
    expect(contentOffset).toBeLessThanOrEqual(1);
  });

  test("moves horizontally into and out of an image", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 113 },
      focus: { path: [0, 0], offset: 113 },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: 113,
      anchorPath: [0, 0],
      isCollapsed: true,
    });

    await resetSlateReactRenderProfiler(page);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [1, 0],
      isCollapsed: true,
    });

    const proof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(proof.selection).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    expect(proof.focusOwner.kind).toBe("editor");
    expect(proof.selectionShells?.anchor.node?.path).toBe("1,0");
    expect(proof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(proof.selectionShells?.anchor.element?.path).toBe("1");
    expect(proof.selectionShells?.anchor.element?.isVoid).toBe(true);
    expect(proof.selectionShells?.runtimeIds.length).toBeGreaterThanOrEqual(2);
    expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2);
    expect(proof.renderCounts.byKind.void ?? 0).toBeLessThanOrEqual(1);
    expect(proof.renderCounts.byKind.element ?? 0).toBeLessThanOrEqual(1);
    expect(proof.renderCounts.byKind.spacer ?? 0).toBeLessThanOrEqual(1);
    expect(proof.renderCounts.total).toBeLessThanOrEqual(4);

    await resetSlateReactRenderProfiler(page);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [2, 0],
      isCollapsed: true,
    });

    const afterImageProof = await takeSlateBrowserRenderStateSnapshot(editor);

    expect(afterImageProof.selection).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    expect(afterImageProof.selectionShells?.anchor.node?.path).toBe("2,0");
    expect(afterImageProof.selectionShells?.anchor.element?.path).toBe("2");
    expect(afterImageProof.selectionShells?.anchor.element?.isVoid).toBe(false);
    expect(
      afterImageProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(2);
    expect(afterImageProof.renderCounts.byKind.void ?? 0).toBeLessThanOrEqual(
      1
    );
    expect(
      afterImageProof.renderCounts.byKind.element ?? 0
    ).toBeLessThanOrEqual(1);
    expect(afterImageProof.renderCounts.byKind.spacer ?? 0).toBeLessThanOrEqual(
      1
    );
    expect(afterImageProof.renderCounts.total).toBeLessThanOrEqual(4);

    await page.keyboard.press("ArrowLeft");
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [1, 0],
      isCollapsed: true,
    });
  });

  test("keeps vertical arrow movement into an image synchronized", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "firefox" || testInfo.project.name === "mobile",
      "Chromium/WebKit vertical image ArrowDown proof; Firefox moves after the image to [2,0] offset 20"
    );

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 113 },
      focus: { path: [0, 0], offset: 113 },
    });

    await page.keyboard.press("ArrowDown");

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [1, 0],
      isCollapsed: true,
    });
    await expect
      .poll(() =>
        editor.root
          .locator("img")
          .first()
          .evaluate((element) => getComputedStyle(element).boxShadow)
      )
      .not.toBe("none");
  });

  test("extends horizontal selection into an image with Shift+ArrowRight", async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop image proof");

    const editor = await openExample(page, "slate/images", {
      ready: {
        editor: "visible",
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 113 },
      focus: { path: [0, 0], offset: 113 },
    });

    await page.keyboard.press("Shift+ArrowRight");

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 113 },
        focus: { path: [1, 0], offset: 0 },
      });
    await expect
      .poll(() =>
        editor.root.evaluate((element) => {
          const root = element.getRootNode() as Document | ShadowRoot;
          const selection =
            "getSelection" in root
              ? root.getSelection()
              : element.ownerDocument.getSelection();
          const pathFor = (node: Node | null) => {
            const current =
              node?.nodeType === Node.TEXT_NODE
                ? node.parentElement
                : node instanceof HTMLElement
                ? node
                : null;
            return (
              current
                ?.closest('[data-slate-node="text"]')
                ?.getAttribute("data-slate-path")
                ?.split(",")
                .filter(Boolean)
                .map(Number) ?? null
            );
          };

          return {
            anchorOffset: selection?.anchorOffset ?? null,
            anchorPath: pathFor(selection?.anchorNode ?? null),
            focusOffset: selection?.focusOffset ?? null,
            focusPath: pathFor(selection?.focusNode ?? null),
            isCollapsed: selection?.isCollapsed ?? null,
          };
        })
      )
      .toEqual({
        anchorOffset: 113,
        anchorPath: [0, 0],
        focusOffset: 0,
        focusPath: [1, 0],
        isCollapsed: false,
      });
  });
});
