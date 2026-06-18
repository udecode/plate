import {
  PathApi,
  type Point,
  type Range,
  type RuntimeId,
} from '@platejs/slate';
import { isDOMElement, isDOMText } from '@platejs/slate-dom';

import { getSlateNodePathFromDOMElement } from '../hooks/use-slate-node-ref';
import { Editor } from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';

const resolveSlateTextPointFromDOMPoint = (
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
  const textHost = anchorElement?.closest('[data-slate-node="text"]');
  const stringHost = anchorElement?.closest(
    '[data-slate-string], [data-slate-zero-width]'
  );

  if (!textHost || !stringHost) {
    return null;
  }

  const path = getSlateNodePathFromDOMElement(textHost);
  const slateNode = path ? readRuntimeText(editor, path) : null;

  if (!path || !slateNode) return null;

  if (requireCurrentRuntimeBinding) {
    const runtimeId = textHost.getAttribute(
      'data-slate-runtime-id'
    ) as RuntimeId | null;
    const currentPath = runtimeId
      ? Editor.getPathByRuntimeId(editor, runtimeId)
      : null;

    if (!currentPath || !PathApi.equals(currentPath, path)) {
      return null;
    }
  }

  if (!isDOMText(anchorNode)) {
    return null;
  }

  const strings = Array.from(
    textHost.querySelectorAll('[data-slate-string], [data-slate-zero-width]')
  );
  let offset = 0;

  for (const string of strings) {
    const lengthAttribute = string.getAttribute('data-slate-length');
    const length =
      lengthAttribute == null
        ? (string.textContent?.length ?? 0)
        : Number.parseInt(lengthAttribute, 10);

    if (string === stringHost) {
      const nextOffset = Math.max(
        0,
        Math.min(slateNode.text.length, offset + anchorOffset)
      );

      return { path, offset: nextOffset };
    }

    offset += Number.isFinite(length) ? length : 0;
  }

  return null;
};

export const resolveSlateCollapsedRangeFromDOMSelection = (
  editor: Editor,
  domSelection: globalThis.Selection
): Range | null => {
  if (!domSelection.isCollapsed) {
    return null;
  }

  const anchor = resolveSlateTextPointFromDOMPoint(
    editor,
    domSelection.anchorNode,
    domSelection.anchorOffset
  );

  return anchor ? { anchor, focus: anchor } : null;
};

export const resolveSlateRangeFromDOMTextRange = (
  editor: Editor,
  domRange: StaticRange,
  {
    requireCurrentRuntimeBinding = false,
  }: { requireCurrentRuntimeBinding?: boolean } = {}
): Range | null => {
  const anchor = resolveSlateTextPointFromDOMPoint(
    editor,
    domRange.startContainer,
    domRange.startOffset,
    { requireCurrentRuntimeBinding }
  );
  const focus = resolveSlateTextPointFromDOMPoint(
    editor,
    domRange.endContainer,
    domRange.endOffset,
    { requireCurrentRuntimeBinding }
  );

  return anchor && focus ? { anchor, focus } : null;
};

export const resolveSlateRangeFromDOMSelection = (
  editor: Editor,
  domSelection: globalThis.Selection,
  editorElement: HTMLElement
): Range | null => {
  if (domSelection.isCollapsed) {
    return resolveSlateCollapsedRangeFromDOMSelection(editor, domSelection);
  }

  if (
    domSelection.anchorNode === editorElement &&
    domSelection.focusNode === editorElement
  ) {
    const start = Math.min(domSelection.anchorOffset, domSelection.focusOffset);
    const end = Math.max(domSelection.anchorOffset, domSelection.focusOffset);

    if (start === 0 && end >= editorElement.childNodes.length) {
      return Editor.range(editor, []);
    }
  }

  const selectedText = domSelection.toString().replace(/\uFEFF/g, '');
  const editorText = editorElement.textContent?.replace(/\uFEFF/g, '') ?? '';

  if (selectedText && selectedText === editorText) {
    return Editor.range(editor, []);
  }

  return null;
};
