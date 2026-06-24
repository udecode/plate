import { expect, type Locator, type Page } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type {
  CollapsedModelDOMSelectionExpectation,
  DOMSelectionLocationSnapshot,
  DOMSelectionSnapshot,
  DOMSelectionSnapshotExpectation,
  OffsetExpectation,
  SelectionPoint,
  SelectionSnapshot,
  SelectionSnapshotExpectation,
} from './types';

const matchesOffsetExpectation = (
  expected: OffsetExpectation,
  actual: number
): boolean => {
  if (Array.isArray(expected)) {
    return actual >= expected[0] && actual <= expected[1];
  }

  return actual === expected;
};

const matchesSelectionExpectation = (
  actual: SelectionSnapshot | null,
  expected: SelectionSnapshotExpectation
): boolean => {
  if (!actual) {
    return false;
  }

  const pathsEqual =
    actual.anchor.path.length === expected.anchor.path.length &&
    actual.focus.path.length === expected.focus.path.length &&
    actual.anchor.path.every(
      (segment, index) => segment === expected.anchor.path[index]
    ) &&
    actual.focus.path.every(
      (segment, index) => segment === expected.focus.path[index]
    );

  return (
    pathsEqual &&
    matchesOffsetExpectation(expected.anchor.offset, actual.anchor.offset) &&
    matchesOffsetExpectation(expected.focus.offset, actual.focus.offset)
  );
};

const pathsEqual = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

const normalizeDOMSelectionText = (value: string | null | undefined) =>
  value?.replace(/\uFEFF/g, '') ?? null;

const matchesDOMSelectionExpectation = (
  actual: DOMSelectionSnapshot | null,
  expected: DOMSelectionSnapshotExpectation
): boolean => {
  if (!actual) {
    return false;
  }

  return (
    actual.anchorNodeText === expected.anchorNodeText &&
    actual.focusNodeText === expected.focusNodeText &&
    matchesOffsetExpectation(expected.anchorOffset, actual.anchorOffset) &&
    matchesOffsetExpectation(expected.focusOffset, actual.focusOffset)
  );
};

export const assertCollapsedModelDOMSelectionExpectation = async (
  root: Locator,
  expected: CollapsedModelDOMSelectionExpectation
) => {
  let actual: {
    dom: DOMSelectionSnapshot | null;
    domResolved: SelectionSnapshot | null;
    inputState: unknown;
    kernelTrace: unknown[];
    model: SelectionSnapshot | null;
  } | null = null;

  try {
    await expect
      .poll(async () => {
        const [model, dom, domResolved, inputState, kernelTrace] =
          await Promise.all([
            takeSelectionSnapshotForRoot(root),
            takeDOMSelectionSnapshotForRoot(root),
            takeResolvedDOMSelectionSnapshotForRoot(root),
            root.evaluate(
              (element: HTMLElement, { key }: { key: string }) => {
                const handle = (element as Record<string, any>)[key];

                return handle?.getInputState?.() ?? null;
              },
              { key: PLITE_BROWSER_HANDLE_KEY }
            ),
            root.evaluate(
              (element: HTMLElement, { key }: { key: string }) => {
                const handle = (element as Record<string, any>)[key];

                return handle?.getKernelTrace?.()?.slice(-8) ?? [];
              },
              { key: PLITE_BROWSER_HANDLE_KEY }
            ),
          ]);

        actual = { dom, domResolved, inputState, kernelTrace, model };

        if (!model || !dom) {
          return false;
        }

        const modelCollapsed =
          pathsEqual(model.anchor.path, model.focus.path) &&
          model.anchor.offset === model.focus.offset;
        const domCollapsed = dom.anchorOffset === dom.focusOffset;
        const modelAtPath =
          pathsEqual(model.anchor.path, expected.path) &&
          pathsEqual(model.focus.path, expected.path);
        const domText =
          normalizeDOMSelectionText(dom.anchorNodeText) === expected.text &&
          normalizeDOMSelectionText(dom.focusNodeText) === expected.text;
        const rawSameOffset =
          model.anchor.offset === dom.anchorOffset &&
          model.focus.offset === dom.focusOffset;
        const resolvedDOMCollapsed =
          !!domResolved &&
          pathsEqual(domResolved.anchor.path, domResolved.focus.path) &&
          domResolved.anchor.offset === domResolved.focus.offset;
        const resolvedDOMAtPath =
          !!domResolved &&
          pathsEqual(domResolved.anchor.path, expected.path) &&
          pathsEqual(domResolved.focus.path, expected.path);
        const resolvedSameOffset =
          !!domResolved &&
          model.anchor.offset === domResolved.anchor.offset &&
          model.focus.offset === domResolved.focus.offset;
        const sameOffset = domResolved
          ? resolvedDOMCollapsed && resolvedDOMAtPath && resolvedSameOffset
          : rawSameOffset;

        return (
          modelCollapsed &&
          domCollapsed &&
          modelAtPath &&
          domText &&
          sameOffset &&
          matchesOffsetExpectation(expected.offset, model.anchor.offset)
        );
      })
      .toBe(true);
  } catch {
    throw new Error(
      `Expected collapsed Plite/DOM selection ${JSON.stringify(
        expected
      )} but received ${JSON.stringify(actual)}`
    );
  }
};

export const assertSelectionExpectation = async (
  root: Locator,
  expected: SelectionSnapshotExpectation
) => {
  let actual: SelectionSnapshot | null = null;

  try {
    await expect
      .poll(async () => {
        actual = await takeSelectionSnapshotForRoot(root);
        return matchesSelectionExpectation(actual, expected);
      })
      .toBe(true);
  } catch {
    throw new Error(
      `Expected Plite selection ${JSON.stringify(
        expected
      )} but received ${JSON.stringify(actual)}`
    );
  }
};

export const assertDOMSelectionExpectation = async (
  root: Locator,
  expected: DOMSelectionSnapshotExpectation
) => {
  let actual: DOMSelectionSnapshot | null = null;

  try {
    await expect
      .poll(async () => {
        actual = await takeDOMSelectionSnapshotForRoot(root);
        return matchesDOMSelectionExpectation(actual, expected);
      })
      .toBe(true);
  } catch {
    throw new Error(
      `Expected DOM selection ${JSON.stringify(
        expected
      )} but received ${JSON.stringify(actual)}`
    );
  }
};

export const assertDOMCaretExpectation = async (
  root: Locator,
  expected: { offset: number; text: string }
) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement) => {
        const rootNode = element.getRootNode() as Document | ShadowRoot;
        const selection =
          'getSelection' in rootNode
            ? rootNode.getSelection()
            : element.ownerDocument.getSelection();

        return {
          anchorOffset: selection?.anchorOffset ?? null,
          anchorText: selection?.anchorNode?.textContent ?? null,
          isCollapsed: selection?.isCollapsed ?? null,
          isTextNode: selection?.anchorNode?.nodeType === Node.TEXT_NODE,
        };
      })
    )
    .toEqual({
      anchorOffset: expected.offset,
      anchorText: expected.text,
      isCollapsed: true,
      isTextNode: true,
    });
};

/** Capture the current DOM selection from a Playwright page. */
export const takeDOMSelectionSnapshot = async (
  page: Page
): Promise<DOMSelectionSnapshot | null> =>
  page.evaluate(() => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    return {
      anchorNodeText: selection.anchorNode?.textContent ?? null,
      anchorOffset: selection.anchorOffset,
      focusNodeText: selection.focusNode?.textContent ?? null,
      focusOffset: selection.focusOffset,
    };
  });

export const takeDOMSelectionSnapshotForRoot = async (
  root: Locator
): Promise<DOMSelectionSnapshot | null> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    if (
      !element.contains(selection.anchorNode) ||
      !element.contains(selection.focusNode)
    ) {
      return null;
    }

    return {
      anchorNodeText: selection.anchorNode?.textContent ?? null,
      anchorOffset: selection.anchorOffset,
      focusNodeText: selection.focusNode?.textContent ?? null,
      focusOffset: selection.focusOffset,
    };
  });

const takeResolvedDOMSelectionSnapshotForRoot = async (
  root: Locator
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const handle = (element as Record<string, any>)[key];
      const selection = handle?.getDOMSelection?.();

      if (!selection) {
        return null;
      }

      return {
        anchor: {
          offset: selection.anchor.offset,
          path: [...selection.anchor.path],
        },
        focus: {
          offset: selection.focus.offset,
          path: [...selection.focus.path],
        },
      };
    },
    { key: PLITE_BROWSER_HANDLE_KEY }
  );

export const takeDOMSelectionLocationSnapshotForRoot = async (
  root: Locator
): Promise<DOMSelectionLocationSnapshot | null> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (!selection?.anchorNode) {
      return null;
    }

    const anchorNode = selection.anchorNode;
    const anchorElement =
      anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : anchorNode instanceof HTMLElement
          ? anchorNode
          : null;
    const textElement = anchorElement?.closest('[data-plite-node="text"]');
    const anchorPath = textElement
      ?.getAttribute('data-plite-path')
      ?.split(',')
      .filter(Boolean)
      .map(Number);

    return {
      anchorOffset: selection.anchorOffset ?? null,
      anchorPath: anchorPath ?? null,
      anchorText: anchorNode.textContent ?? null,
      isCollapsed: selection.isCollapsed ?? null,
    };
  });

/** Capture the current Plite model selection from a Playwright page. */
export const takeSelectionSnapshot = async (
  page: Page
): Promise<SelectionSnapshot | null> =>
  page.evaluate(
    ({ key }) => {
      const root = document.querySelector('[data-plite-editor="true"]');
      const selection = window.getSelection();

      if (!root || !selection || selection.rangeCount === 0) {
        return null;
      }

      const handle = (root as Record<string, any>)[key];

      if (handle?.getSelection) {
        return handle.getSelection();
      }

      const getTextSegments = (owner: Element) =>
        Array.from(
          owner.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
        ).map((segment) => {
          const leafNode = segment.firstChild;
          const domLength = leafNode?.textContent?.length ?? 0;
          const attr = segment.getAttribute('data-plite-length');
          const trueLength =
            attr == null ? domLength : Number.parseInt(attr, 10);

          return {
            domLength,
            segment,
            trueLength,
          };
        });
      const findZeroWidthMarker = (node: Node | null) => {
        const element =
          node?.nodeType === 1 ? (node as Element) : node?.parentElement;

        return element?.closest('[data-plite-zero-width]') ?? null;
      };
      const toEditorOffset = (node: Node | null, offset: number) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');
        const segment =
          node?.nodeType === 1
            ? (node as Element).closest(
                '[data-plite-string], [data-plite-zero-width]'
              )
            : node?.parentElement?.closest(
                '[data-plite-string], [data-plite-zero-width]'
              );

        const localOffset = findZeroWidthMarker(node) ? 0 : offset;

        if (!owner || !segment) {
          return localOffset;
        }

        const segments = getTextSegments(owner);
        const segmentIndex = segments.findIndex(
          (entry) => entry.segment === segment
        );

        if (segmentIndex <= 0) {
          return localOffset;
        }

        return (
          segments
            .slice(0, segmentIndex)
            .reduce((total, entry) => total + entry.trueLength, 0) + localOffset
        );
      };
      const getPath = (node: Node | null) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');

        if (!owner) {
          throw new Error('Cannot resolve selection to a Plite text node');
        }

        if (!root.contains(owner)) {
          throw new Error('Selection text node is outside the editor root');
        }

        const pathAttribute = owner.getAttribute('data-plite-path');

        if (!pathAttribute) {
          throw new Error('Cannot resolve selection to a Plite DOM path');
        }

        const path = pathAttribute
          .split(',')
          .map((part) => Number.parseInt(part, 10));

        if (path.some((part) => !Number.isInteger(part))) {
          throw new Error('Invalid Plite DOM path');
        }

        return path;
      };

      return {
        anchor: {
          path: getPath(selection.anchorNode),
          offset: toEditorOffset(selection.anchorNode, selection.anchorOffset),
        },
        focus: {
          path: getPath(selection.focusNode),
          offset: toEditorOffset(selection.focusNode, selection.focusOffset),
        },
      };
    },
    { key: PLITE_BROWSER_HANDLE_KEY }
  );

export const takeSelectionSnapshotForRoot = async (
  root: Locator
): Promise<SelectionSnapshot | null> =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const handle = (element as Record<string, any>)[key];

      if (handle?.getSelection) {
        return handle.getSelection();
      }

      const rootNode = element.getRootNode() as Document | ShadowRoot;
      const selection =
        'getSelection' in rootNode
          ? rootNode.getSelection()
          : element.ownerDocument.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      if (
        !element.contains(selection.anchorNode) ||
        !element.contains(selection.focusNode)
      ) {
        return null;
      }

      const getTextSegments = (owner: Element) =>
        Array.from(
          owner.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
        ).map((segment) => {
          const leafNode = segment.firstChild;
          const domLength = leafNode?.textContent?.length ?? 0;
          const attr = segment.getAttribute('data-plite-length');
          const trueLength =
            attr == null ? domLength : Number.parseInt(attr, 10);

          return {
            domLength,
            segment,
            trueLength,
          };
        });

      const findZeroWidthMarker = (node: Node | null) => {
        const markerElement =
          node?.nodeType === 1 ? (node as Element) : node?.parentElement;

        return markerElement?.closest('[data-plite-zero-width]') ?? null;
      };

      const toEditorOffset = (node: Node | null, offset: number) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');
        const segment =
          node?.nodeType === 1
            ? (node as Element).closest(
                '[data-plite-string], [data-plite-zero-width]'
              )
            : node?.parentElement?.closest(
                '[data-plite-string], [data-plite-zero-width]'
              );

        const localOffset = findZeroWidthMarker(node) ? 0 : offset;

        if (!owner || !segment) {
          return localOffset;
        }

        const segments = getTextSegments(owner);
        const segmentIndex = segments.findIndex(
          (entry) => entry.segment === segment
        );

        if (segmentIndex <= 0) {
          return localOffset;
        }

        return (
          segments
            .slice(0, segmentIndex)
            .reduce((total, entry) => total + entry.trueLength, 0) + localOffset
        );
      };

      const getPath = (node: Node | null) => {
        const owner =
          node?.nodeType === 1
            ? (node as Element).closest('[data-plite-node="text"]')
            : node?.parentElement?.closest('[data-plite-node="text"]');

        if (!owner) {
          throw new Error('Cannot resolve selection to a Plite text node');
        }

        if (!element.contains(owner)) {
          throw new Error('Selection text node is outside the editor root');
        }

        const pathAttribute = owner.getAttribute('data-plite-path');

        if (!pathAttribute) {
          throw new Error('Cannot resolve selection to a Plite DOM path');
        }

        const path = pathAttribute
          .split(',')
          .map((part) => Number.parseInt(part, 10));

        if (path.some((part) => !Number.isInteger(part))) {
          throw new Error('Invalid Plite DOM path');
        }

        return path;
      };

      return {
        anchor: {
          path: getPath(selection.anchorNode),
          offset: toEditorOffset(selection.anchorNode, selection.anchorOffset),
        },
        focus: {
          path: getPath(selection.focusNode),
          offset: toEditorOffset(selection.focusNode, selection.focusOffset),
        },
      };
    },
    { key: PLITE_BROWSER_HANDLE_KEY }
  );

export const waitForSelectionSync = async (
  root: Locator,
  expectedSelection?: SelectionSnapshot
) => {
  const readSyncState = () =>
    root.evaluate(
      (
        element: HTMLElement,
        {
          expectedSelection,
          key,
        }: { expectedSelection?: SelectionSnapshot; key: string }
      ) => {
        const pointsEqual = (
          left: SelectionPoint | null | undefined,
          right: SelectionPoint | null | undefined
        ) =>
          !!left &&
          !!right &&
          left.offset === right.offset &&
          left.path.length === right.path.length &&
          left.path.every((part, index) => part === right.path[index]);
        const selectionsEqual = (
          left: SelectionSnapshot | null | undefined,
          right: SelectionSnapshot | null | undefined
        ) =>
          !!left &&
          !!right &&
          pointsEqual(left.anchor, right.anchor) &&
          pointsEqual(left.focus, right.focus);
        const rootNode = element.getRootNode() as Document | ShadowRoot;
        const selection =
          'getSelection' in rootNode
            ? rootNode.getSelection()
            : element.ownerDocument.getSelection();
        const nativeSelectionInRoot = Boolean(
          selection?.rangeCount &&
            selection.anchorNode &&
            selection.focusNode &&
            element.contains(selection.anchorNode) &&
            element.contains(selection.focusNode)
        );
        const getNativeSelectionSnapshot = () => {
          if (
            !selection?.rangeCount ||
            !selection.anchorNode ||
            !selection.focusNode ||
            !element.contains(selection.anchorNode) ||
            !element.contains(selection.focusNode)
          ) {
            return null;
          }

          const getTextSegments = (owner: Element) =>
            Array.from(
              owner.querySelectorAll(
                '[data-plite-string], [data-plite-zero-width]'
              )
            ).map((segment) => {
              const leafNode = segment.firstChild;
              const domLength = leafNode?.textContent?.length ?? 0;
              const attr = segment.getAttribute('data-plite-length');
              const trueLength =
                attr == null ? domLength : Number.parseInt(attr, 10);

              return {
                segment,
                trueLength,
              };
            });

          const findZeroWidthMarker = (node: Node | null) => {
            const markerElement =
              node?.nodeType === 1 ? (node as Element) : node?.parentElement;

            return markerElement?.closest('[data-plite-zero-width]') ?? null;
          };

          const toEditorOffset = (node: Node | null, offset: number) => {
            const owner =
              node?.nodeType === 1
                ? (node as Element).closest('[data-plite-node="text"]')
                : node?.parentElement?.closest('[data-plite-node="text"]');
            const segment =
              node?.nodeType === 1
                ? (node as Element).closest(
                    '[data-plite-string], [data-plite-zero-width]'
                  )
                : node?.parentElement?.closest(
                    '[data-plite-string], [data-plite-zero-width]'
                  );

            const localOffset = findZeroWidthMarker(node) ? 0 : offset;

            if (!owner || !segment) {
              return localOffset;
            }

            const segments = getTextSegments(owner);
            const segmentIndex = segments.findIndex(
              (entry) => entry.segment === segment
            );

            if (segmentIndex <= 0) {
              return localOffset;
            }

            return (
              segments
                .slice(0, segmentIndex)
                .reduce((total, entry) => total + entry.trueLength, 0) +
              localOffset
            );
          };

          const getPath = (node: Node | null) => {
            const owner =
              node?.nodeType === 1
                ? (node as Element).closest('[data-plite-node="text"]')
                : node?.parentElement?.closest('[data-plite-node="text"]');

            if (!owner || !element.contains(owner)) {
              return null;
            }

            const path = owner
              .getAttribute('data-plite-path')
              ?.split(',')
              .map((part) => Number.parseInt(part, 10));

            return path?.every(Number.isInteger) ? path : null;
          };

          const anchorPath = getPath(selection.anchorNode);
          const focusPath = getPath(selection.focusNode);

          if (!anchorPath || !focusPath) {
            return null;
          }

          return {
            anchor: {
              offset: toEditorOffset(
                selection.anchorNode,
                selection.anchorOffset
              ),
              path: anchorPath,
            },
            focus: {
              offset: toEditorOffset(
                selection.focusNode,
                selection.focusOffset
              ),
              path: focusPath,
            },
          };
        };

        const handle = (element as Record<string, any>)[key];
        const handleSelection =
          typeof handle?.getSelection === 'function'
            ? handle.getSelection()
            : null;

        const nativeSelection = getNativeSelectionSnapshot();
        const modelBackedSelection =
          element.getAttribute('data-plite-dom-strategy-selection') ===
            'partial-dom-backed' ||
          !!element.querySelector('[data-plite-view-selection="true"]');
        const synced = expectedSelection
          ? handle?.getSelection
            ? selectionsEqual(handleSelection, expectedSelection) &&
              (modelBackedSelection ||
                selectionsEqual(nativeSelection, expectedSelection))
            : selectionsEqual(nativeSelection, expectedSelection)
          : handle?.getSelection
            ? modelBackedSelection
              ? !!handleSelection
              : nativeSelection
                ? selectionsEqual(handleSelection, nativeSelection)
                : nativeSelectionInRoot
            : nativeSelectionInRoot;

        return {
          expectedSelection,
          handleSelection,
          modelBackedSelection,
          nativeSelection,
          nativeSelectionInRoot,
          synced,
        };
      },
      { expectedSelection, key: PLITE_BROWSER_HANDLE_KEY }
    );

  await expect
    .poll(() => readSyncState())
    .toMatchObject({ synced: true })
    .catch(async (error: unknown) => {
      const state = await readSyncState().catch((stateError: unknown) => ({
        error:
          stateError instanceof Error ? stateError.message : String(stateError),
      }));

      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\nSelection sync state:\n${JSON.stringify(state, null, 2)}`
      );
    });
  await root.page().waitForTimeout(100);
};
