import { BROWSER_HANDLE_KEY } from './constants';
import { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
import { getRenderedBlockDOMShapes } from './dom-shape';
import { getBlockTexts, getSelectedText } from './dom-text';
import { evaluateHarnessHandle } from './handle';
import { getFocusOwnerSnapshot } from './selection-geometry';
import {
  takeDOMSelectionSnapshotForRoot,
  takeSelectionSnapshotForRoot,
} from './selection-snapshots';
import type {
  BrowserEditorHarness,
  BrowserKernelTraceEntry,
  EditorRoot,
} from './types';

export const createEditorGet = (
  root: EditorRoot
): BrowserEditorHarness['get'] => ({
  modelText: async () => evaluateHarnessHandle(root, 'getText'),
  modelBlockText: async (index) =>
    evaluateHarnessHandle(
      root,
      'getBlockText',
      [index],
      'This editor surface does not expose getBlockText'
    ),
  modelBlockTexts: async () =>
    evaluateHarnessHandle(
      root,
      'getBlockTexts',
      [],
      'This editor surface does not expose getBlockTexts'
    ),
  modelValue: async () =>
    evaluateHarnessHandle(
      root,
      'getValue',
      [],
      'This editor surface does not expose getValue'
    ),
  text: async () => root.evaluate((element) => element.textContent ?? ''),
  blockTexts: async () => getBlockTexts(root),
  renderedDOMShape: async () => getRenderedBlockDOMShapes(root),
  selectedText: async () => getSelectedText(root),
  displayedSelection: async () => takeDisplayedSelectionSnapshotForRoot(root),
  html: async () => root.evaluate((element) => element.innerHTML),
  selection: async () => takeSelectionSnapshotForRoot(root),
  domSelection: async () => takeDOMSelectionSnapshotForRoot(root),
  focusOwner: async () => getFocusOwnerSnapshot(root),
  kernelTrace: async () =>
    root.evaluate(
      (element, { key }: { key: string }) => {
        const handle = (element as Record<string, any>)[key];

        return handle?.getKernelTrace ? handle.getKernelTrace() : [];
      },
      { key: BROWSER_HANDLE_KEY }
    ) as Promise<BrowserKernelTraceEntry[]>,
  history: async () =>
    root.evaluate(
      (element, { key }: { key: string }) => {
        const handle = (element as Record<string, any>)[key];

        return handle?.getHistory ? handle.getHistory() : null;
      },
      { key: BROWSER_HANDLE_KEY }
    ),
  lastCommit: async () =>
    root.evaluate(
      (element, { key }: { key: string }) => {
        const handle = (element as Record<string, any>)[key];

        return handle?.getLastCommit ? handle.getLastCommit() : null;
      },
      { key: BROWSER_HANDLE_KEY }
    ),
  lastPasteVersion: async () =>
    root.evaluate(
      (element, { key }: { key: string }) =>
        (element as Record<string, any>)[key]?.getLastPasteVersion?.(),
      { key: BROWSER_HANDLE_KEY }
    ),
  placeholderShape: async (selector = '[data-editor-zero-width]') =>
    root.evaluate((element, target: string) => {
      const zeroWidth = element.querySelector(target);

      return zeroWidth
        ? {
            hasBr: !!zeroWidth.querySelector('br'),
            hasFEFF: zeroWidth.textContent?.includes('﻿') ?? false,
            kind: zeroWidth.getAttribute('data-editor-zero-width'),
          }
        : null;
    }, selector),
});

export const snapshotEditor = async (get: BrowserEditorHarness['get']) => ({
  text: await get.text(),
  blockTexts: await get.blockTexts(),
  renderedBlocks: await get.renderedDOMShape(),
  selectedText: await get.selectedText(),
  selection: await get.selection(),
  domSelection: await get.domSelection(),
  focusOwner: await get.focusOwner(),
  kernelTrace: await get.kernelTrace(),
  history: await get.history(),
  lastCommit: await get.lastCommit(),
  placeholderShape: await get.placeholderShape(),
});
