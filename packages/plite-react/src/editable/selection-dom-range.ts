import {
  PathApi,
  type Point,
  type Range,
  type RuntimeId,
} from '@platejs/plite';
import { isDOMElement, isDOMText } from '@platejs/plite-dom';

import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import {
  type Editor,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  range as editorRange,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';

const resolvePliteTextPointFromDOMPoint = (
  editor: Editor,
  anchorNode: globalThis.Node | null,
  anchorOffset: number,
  {
    requireCurrentRuntimeBinding = false,
  }: { requireCurrentRuntimeBinding?: boolean } = {}
): Point | null => {
  const anchorElement = isDOMText(anchorNode)
    ? anchorNode.parentElement
    : isDOMElement(anchorNode)
      ? anchorNode
      : null;
  const textHost = anchorElement?.closest('[data-plite-node="text"]');
  const stringHost = anchorElement?.closest(
    '[data-plite-string], [data-plite-zero-width]'
  );

  if (!textHost || !stringHost) {
    return null;
  }

  const path = getPliteNodePathFromDOMElement(textHost);
  const pliteNode = path ? readRuntimeText(editor, path) : null;

  if (!path || !pliteNode) return null;

  if (requireCurrentRuntimeBinding) {
    const runtimeId = textHost.getAttribute(
      'data-plite-runtime-id'
    ) as RuntimeId | null;
    const currentPath = runtimeId
      ? editorGetPathByRuntimeId(editor, runtimeId)
      : null;

    if (!currentPath || !PathApi.equals(currentPath, path)) {
      return null;
    }
  }

  if (!isDOMText(anchorNode)) {
    return null;
  }

  const strings = Array.from(
    textHost.querySelectorAll('[data-plite-string], [data-plite-zero-width]')
  );
  let offset = 0;

  for (const string of strings) {
    const lengthAttribute = string.getAttribute('data-plite-length');
    const length =
      lengthAttribute == null
        ? (string.textContent?.length ?? 0)
        : Number.parseInt(lengthAttribute, 10);

    if (string === stringHost) {
      const nextOffset = Math.max(
        0,
        Math.min(pliteNode.text.length, offset + anchorOffset)
      );

      return { path, offset: nextOffset };
    }

    offset += Number.isFinite(length) ? length : 0;
  }

  return null;
};

export const resolvePliteCollapsedRangeFromDOMSelection = (
  editor: Editor,
  domSelection: globalThis.Selection
): Range | null => {
  if (!domSelection.isCollapsed) {
    return null;
  }

  const anchor = resolvePliteTextPointFromDOMPoint(
    editor,
    domSelection.anchorNode,
    domSelection.anchorOffset
  );

  return anchor ? { anchor, focus: anchor } : null;
};

export const resolvePliteRangeFromDOMTextRange = (
  editor: Editor,
  domRange: StaticRange,
  {
    requireCurrentRuntimeBinding = false,
  }: { requireCurrentRuntimeBinding?: boolean } = {}
): Range | null => {
  const anchor = resolvePliteTextPointFromDOMPoint(
    editor,
    domRange.startContainer,
    domRange.startOffset,
    { requireCurrentRuntimeBinding }
  );
  const focus = resolvePliteTextPointFromDOMPoint(
    editor,
    domRange.endContainer,
    domRange.endOffset,
    { requireCurrentRuntimeBinding }
  );

  return anchor && focus ? { anchor, focus } : null;
};

export const resolvePliteRangeFromDOMSelection = (
  editor: Editor,
  domSelection: globalThis.Selection,
  editorElement: HTMLElement
): Range | null => {
  if (domSelection.isCollapsed) {
    return resolvePliteCollapsedRangeFromDOMSelection(editor, domSelection);
  }

  if (
    domSelection.anchorNode === editorElement &&
    domSelection.focusNode === editorElement
  ) {
    const start = Math.min(domSelection.anchorOffset, domSelection.focusOffset);
    const end = Math.max(domSelection.anchorOffset, domSelection.focusOffset);

    if (start === 0 && end >= editorElement.childNodes.length) {
      return editorRange(editor, []);
    }
  }

  const selectedText = domSelection.toString().replace(/\uFEFF/g, '');
  const editorText = editorElement.textContent?.replace(/\uFEFF/g, '') ?? '';

  if (selectedText && selectedText === editorText) {
    return editorRange(editor, []);
  }

  return null;
};
