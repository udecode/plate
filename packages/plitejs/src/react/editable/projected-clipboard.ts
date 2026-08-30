import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Range,
  RangeApi,
} from '../..';
import {
  getDOMClipboardFormatKey,
  readDOMFragmentData,
  writeDOMHostFragmentData,
} from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { resolvePliteViewBoundarySegmentEndpoint } from '../view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  type PliteViewSelection,
} from '../view-selection';
import {
  type Editor as RuntimeEditor,
  getEditorRuntimeOwner,
} from './runtime-editor-api';

const escapeHtmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const getCanonicalRuntimeEditor = (editor: RuntimeEditor) =>
  getEditorRuntimeOwner(editor);

const getProjectedClipboardFormatKey = (editor: RuntimeEditor) => {
  const viewEditorKey = getDOMClipboardFormatKey(editor);

  return viewEditorKey === 'x-plite-fragment'
    ? getDOMClipboardFormatKey(getCanonicalRuntimeEditor(editor))
    : viewEditorKey;
};

export const decodeProjectedClipboardFragment = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'getData'>
): ContentSliceValue | null =>
  readDOMFragmentData(editor, data, getProjectedClipboardFormatKey(editor));

const getProjectedViewSelectionClipboardRanges = (
  editor: ReactRuntimeEditor,
  viewSelection: PliteViewSelection
): Range[] | null =>
  editor.read((state) => {
    const rootKeys = new Set(
      viewSelection.segments.parts.flatMap((segment) => [
        segment.root,
        ...(segment.start.kind === 'boundary' ? [segment.start.node.root] : []),
        ...(segment.end.kind === 'boundary' ? [segment.end.node.root] : []),
      ])
    );
    const roots = Object.fromEntries(
      [...rootKeys].map((root) => [
        root,
        root === 'main' ? state.children() : state.root(root),
      ])
    );
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

export const getProjectedViewSelectionSlice = (
  editor: ReactRuntimeEditor
): ContentSliceValue | null => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return null;
  }

  const runtimeEditor = getCanonicalRuntimeEditor(editor) as ReactRuntimeEditor;
  const ranges = getProjectedViewSelectionClipboardRanges(
    runtimeEditor,
    viewSelection
  );

  if (!ranges) return null;

  return runtimeEditor.read((state) => {
    const slices = ranges
      .map((range) => state.slice.get({ at: range }))
      .filter((slice) => slice.content.length > 0);
    const first = slices[0];
    const last = slices.at(-1);

    if (!first || !last) return null;
    const roots = Object.fromEntries(
      slices.flatMap((slice) => Object.entries(slice.roots ?? {}))
    );

    // Projected segments meet at closed root boundaries. Only the two outer
    // document edges carry slice openness into the clipboard envelope.
    return ContentSlice.fromJSON({
      content: slices.flatMap((slice) => slice.content),
      openEnd: last.openEnd,
      openStart: first.openStart,
      ...(Object.keys(roots).length > 0 ? { roots } : {}),
    });
  });
};

export const writeProjectedViewSelectionClipboardData = (
  editor: ReactRuntimeEditor,
  data: Pick<DataTransfer, 'getData' | 'setData'>
) => {
  const slice = getProjectedViewSelectionSlice(editor);

  if (!slice || slice.content.length === 0) {
    return false;
  }

  const clipboardFormatKey = getProjectedClipboardFormatKey(editor);

  writeDOMHostFragmentData(getCanonicalRuntimeEditor(editor), data, {
    clipboardFormatKey,
    html: ({ text }) => `<span>${escapeHtmlText(text)}</span>`,
    slice,
  });

  return true;
};
