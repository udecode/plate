import { type Descendant, NodeApi, type Range, RangeApi } from '@platejs/plite';
import { getDOMClipboardFormatKey } from '@platejs/plite-dom/internal';

import {
  createPliteViewBoundaryRootMap,
  resolvePliteViewBoundarySegmentEndpoint,
} from '../view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  type PliteViewSelection,
} from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

const DEFAULT_PLITE_CLIPBOARD_FORMAT_KEY = 'x-plite-fragment';
const PLITE_FRAGMENT_FORMAT_ATTRIBUTE = 'data-plite-fragment-format';

const escapeHtmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const escapeHtmlAttribute = (text: string) =>
  escapeHtmlText(text).replaceAll('"', '&quot;');

const getFragmentText = (fragment: readonly Descendant[]) =>
  fragment.map((node) => NodeApi.string(node)).join('\n');

const encodeClipboardFragment = (fragment: readonly Descendant[]) =>
  globalThis.btoa(encodeURIComponent(JSON.stringify(fragment)));

const getCanonicalRuntimeEditor = (editor: RuntimeEditor): RuntimeEditor =>
  ((editor as { runtime?: { editor?: RuntimeEditor } }).runtime?.editor ??
    editor) as RuntimeEditor;

const getProjectedClipboardFormatKey = (editor: RuntimeEditor) => {
  const viewEditorKey = getDOMClipboardFormatKey(editor);

  return viewEditorKey === DEFAULT_PLITE_CLIPBOARD_FORMAT_KEY
    ? getDOMClipboardFormatKey(getCanonicalRuntimeEditor(editor))
    : viewEditorKey;
};

export const getProjectedClipboardFragmentData = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'getData'>
) => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);
  const clipboardFragment = data.getData(`application/${clipboardFormatKey}`);

  if (clipboardFragment) {
    return clipboardFragment;
  }

  const html = data.getData('text/html');
  const DOMParser = globalThis.DOMParser;

  if (!html || typeof DOMParser !== 'function') {
    return '';
  }

  const document = new DOMParser().parseFromString(html, 'text/html');
  const htmlFragment = document.querySelector('[data-plite-fragment]');

  if (!htmlFragment) {
    return '';
  }

  const htmlFragmentData =
    htmlFragment.getAttribute('data-plite-fragment') ?? '';

  if (!htmlFragmentData) {
    return '';
  }

  const fragmentFormat =
    htmlFragment.getAttribute(PLITE_FRAGMENT_FORMAT_ATTRIBUTE) ?? undefined;

  if (fragmentFormat) {
    return fragmentFormat === clipboardFormatKey ? htmlFragmentData : '';
  }

  return clipboardFormatKey === DEFAULT_PLITE_CLIPBOARD_FORMAT_KEY
    ? htmlFragmentData
    : '';
};

export const decodeProjectedClipboardFragment = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'getData'>
): Descendant[] | null => {
  const fragment = getProjectedClipboardFragmentData(editor, data);

  if (!fragment || typeof globalThis.atob !== 'function') {
    return null;
  }

  try {
    const decoded = decodeURIComponent(globalThis.atob(fragment));
    const parsed = JSON.parse(decoded);

    return Array.isArray(parsed) ? (parsed as Descendant[]) : null;
  } catch {
    return null;
  }
};

const getProjectedViewSelectionClipboardRanges = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): Range[] | null =>
  editor.read((state) => {
    const roots = createPliteViewBoundaryRootMap(state.value.get());
    const ranges: Range[] = [];

    for (const segment of viewSelection.segments.parts) {
      const anchor = resolvePliteViewBoundarySegmentEndpoint(
        roots,
        segment,
        segment.start
      );
      const focus = resolvePliteViewBoundarySegmentEndpoint(
        roots,
        segment,
        segment.end
      );

      if (!anchor || !focus) {
        return null;
      }

      const range = { anchor, focus };

      if (!RangeApi.isCollapsed(range)) {
        ranges.push(range);
      }
    }

    return ranges;
  });

export const getProjectedViewSelectionFragment = (
  editor: RuntimeEditor
): Descendant[] | null => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return null;
  }

  const ranges = getProjectedViewSelectionClipboardRanges(
    editor,
    viewSelection
  );

  if (!ranges) {
    return null;
  }

  return editor.read((state) =>
    ranges.flatMap((range) => state.fragment.get({ at: range }))
  );
};

export const writeProjectedViewSelectionClipboardData = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'setData'>
) => {
  const fragment = getProjectedViewSelectionFragment(editor);

  if (!fragment || fragment.length === 0) {
    return false;
  }

  const encoded = encodeClipboardFragment(fragment);
  const text = getFragmentText(fragment);
  const clipboardFormatKey = getProjectedClipboardFormatKey(editor);
  const escapedClipboardFormatKey = escapeHtmlAttribute(clipboardFormatKey);

  data.setData(`application/${clipboardFormatKey}`, encoded);
  data.setData('text/plain', text);
  data.setData(
    'text/html',
    `<span data-plite-fragment="${encoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapedClipboardFormatKey}">${escapeHtmlText(text)}</span>`
  );

  return true;
};
