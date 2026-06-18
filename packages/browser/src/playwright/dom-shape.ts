import { expect, type Locator } from '@playwright/test';

import type {
  DOMSelectionLocationSnapshot,
  RenderedBlockDOMShapeSnapshot,
  RenderedDOMShapeExpectation,
} from './types';

type DOMSelectionLocationReader = (
  root: Locator
) => Promise<DOMSelectionLocationSnapshot | null>;

export const getRenderedBlockDOMShapes = async (
  root: Locator
): Promise<RenderedBlockDOMShapeSnapshot[]> =>
  root.evaluate((element: HTMLElement) => {
    const normalizeText = (text: string) => text.replace(/\uFEFF/g, '');
    const countLineBoxes = (block: Element) => {
      const ownerDocument = block.ownerDocument;
      const range = ownerDocument.createRange();

      range.selectNodeContents(block);

      const tops = new Set<number>();

      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width === 0 && rect.height === 0) {
          continue;
        }

        tops.add(Math.round(rect.top));
      }

      range.detach();

      return tops.size;
    };

    return Array.from(
      element.querySelectorAll(':scope > [data-slate-node="element"]')
    ).map((block, index) => {
      const textContent = normalizeText(block.textContent ?? '');
      const innerText = normalizeText(
        block instanceof HTMLElement
          ? (block.innerText ?? block.textContent ?? '')
          : (block.textContent ?? '')
      );
      const zeroWidthNodes = Array.from(
        block.querySelectorAll('[data-slate-zero-width]')
      ).map((zeroWidth, zeroWidthIndex) => ({
        hasBr: !!zeroWidth.querySelector('br'),
        hasFEFF: zeroWidth.textContent?.includes('\uFEFF') ?? false,
        html: zeroWidth.innerHTML,
        index: zeroWidthIndex,
        kind: zeroWidth.getAttribute('data-slate-zero-width'),
        length: zeroWidth.getAttribute('data-slate-length'),
        textContent: zeroWidth.textContent ?? '',
      }));

      return {
        index,
        innerText,
        lineBoxCount: countLineBoxes(block),
        textContent,
        unexpectedZeroWidthBreaks: zeroWidthNodes.filter(
          (zeroWidth) => textContent !== '' && zeroWidth.hasBr
        ),
        zeroWidthNodes,
      };
    });
  });

export const getRenderedBlockDOMShape = async (
  root: Locator,
  blockIndex: number
): Promise<RenderedBlockDOMShapeSnapshot> => {
  const shape = (await getRenderedBlockDOMShapes(root))[blockIndex];

  if (!shape) {
    throw new Error(`Missing rendered block DOM shape for index ${blockIndex}`);
  }

  return shape;
};

export const assertRenderedBlockText = async (
  root: Locator,
  blockIndex: number,
  text: string
) => {
  await expect
    .poll(
      async () => (await getRenderedBlockDOMShape(root, blockIndex)).textContent
    )
    .toBe(text);
};

export const assertNoUnexpectedZeroWidthBreaks = async (
  root: Locator,
  blockIndex: number
) => {
  await expect
    .poll(
      async () =>
        (await getRenderedBlockDOMShape(root, blockIndex))
          .unexpectedZeroWidthBreaks
    )
    .toEqual([]);
};

export const assertRenderedDOMShape = async (
  root: Locator,
  expected: RenderedDOMShapeExpectation,
  readDOMSelectionLocation?: DOMSelectionLocationReader
) => {
  const blockIndex = expected.blockIndex ?? 0;

  await expect
    .poll(() => getRenderedBlockDOMShape(root, blockIndex))
    .toEqual(
      expect.objectContaining({
        ...(expected.innerText == null
          ? {}
          : { innerText: expected.innerText }),
        ...(expected.textContent == null
          ? {}
          : { textContent: expected.textContent }),
      })
    );

  const shape = await getRenderedBlockDOMShape(root, blockIndex);

  if (expected.zeroWidthCount != null) {
    expect(shape.zeroWidthNodes).toHaveLength(expected.zeroWidthCount);
  }

  if (expected.zeroWidthBreakCount != null) {
    expect(shape.zeroWidthNodes.filter((node) => node.hasBr)).toHaveLength(
      expected.zeroWidthBreakCount
    );
  }

  if (expected.noUnexpectedZeroWidthBreaks) {
    await assertNoUnexpectedZeroWidthBreaks(root, blockIndex);
  }

  if (typeof expected.lineBoxCount === 'number') {
    expect(shape.lineBoxCount).toBe(expected.lineBoxCount);
  } else if (expected.lineBoxCount) {
    if (expected.lineBoxCount.min != null) {
      expect(shape.lineBoxCount).toBeGreaterThanOrEqual(
        expected.lineBoxCount.min
      );
    }

    if (expected.lineBoxCount.max != null) {
      expect(shape.lineBoxCount).toBeLessThanOrEqual(expected.lineBoxCount.max);
    }
  }

  if (expected.domSelectionTarget) {
    if (!readDOMSelectionLocation) {
      throw new Error(
        'DOM selection target assertions require a DOM selection location reader'
      );
    }

    await expect
      .poll(() => readDOMSelectionLocation(root))
      .toMatchObject(expected.domSelectionTarget);
  }
};
