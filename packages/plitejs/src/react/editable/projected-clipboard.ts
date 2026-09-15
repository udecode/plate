import {
  ContentSlice,
  type ContentSlice as ContentSliceValue,
  type Descendant,
  NodeApi,
  RangeApi,
  SelectionApi,
} from '../..';
import { createAuthoredFragmentView } from '../../core/authored-fragment-view';
import { readAuthoredViewFragments } from '../../core/authored-runtime';
import { rewriteContentRootReferences } from '../../core/content-slice-roots';
import { exportContentSlice } from '../../core/editor-read-execution';
import {
  getDOMClipboardFormatKey,
  readDOMFragmentData,
  writeDOMHostFragmentData,
} from '../../dom/internal';
import { readRootChildren } from '../root-key';
import { resolvePliteViewBoundarySegmentEndpoint } from '../view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
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

  return viewEditorKey === 'x-editor-fragment'
    ? getDOMClipboardFormatKey(getCanonicalRuntimeEditor(editor))
    : viewEditorKey;
};

export const decodeProjectedClipboardFragment = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'getData'>
): ContentSliceValue | null =>
  readDOMFragmentData(editor, data, getProjectedClipboardFormatKey(editor));

const joinSliceContent = (
  left: readonly Descendant[],
  right: readonly Descendant[],
  depth: number
): readonly Descendant[] => {
  if (!depth) return [...left, ...right];
  const before = left.at(-1);
  const after = right[0];
  if (
    !before ||
    !after ||
    !NodeApi.isElement(before) ||
    !NodeApi.isElement(after)
  ) {
    throw new Error(
      'Projected clipboard content lost its shared element context.'
    );
  }
  return [
    ...left.slice(0, -1),
    {
      ...before,
      children: joinSliceContent(before.children, after.children, depth - 1),
    },
    ...right.slice(1),
  ];
};

const allocateProjectedRoot = (root: string, reserved: Set<string>) => {
  if (!reserved.has(root)) {
    reserved.add(root);

    return root;
  }

  const base = `${root}:projection`;
  let candidate = base;
  let suffix = 2;

  while (reserved.has(candidate)) {
    candidate = `${base}:${suffix}`;
    suffix += 1;
  }
  reserved.add(candidate);

  return candidate;
};

export const remapProjectedSourceSlice = (
  editor: RuntimeEditor,
  slice: ContentSliceValue,
  rootNames: Map<string, string>,
  reservedRoots: Set<string>
): Readonly<{
  content: readonly Descendant[];
  roots: Readonly<Record<string, readonly Descendant[]>>;
}> | null => {
  const pending: string[] = [];
  const visited = new Set<string>();
  const resolveRoot = (root: string) => {
    let target = rootNames.get(root);

    if (!target) {
      target = allocateProjectedRoot(root, reservedRoots);
      rootNames.set(root, target);
    }
    pending.push(root);

    return target;
  };
  const content = rewriteContentRootReferences(
    editor,
    slice.content,
    resolveRoot
  );
  const roots: Record<string, readonly Descendant[]> = {};

  while (pending.length > 0) {
    const source = pending.shift();

    if (source === undefined) continue;
    if (visited.has(source)) continue;
    visited.add(source);
    const children = slice.roots?.[source];
    const target = rootNames.get(source);

    if (!children || !target) return null;
    roots[target] = rewriteContentRootReferences(editor, children, resolveRoot);
  }

  return { content, roots };
};

export const getProjectedViewSelectionSlice = (
  editor: RuntimeEditor
): ContentSliceValue | null => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return null;
  }

  let content: readonly Descendant[] | null = null;
  let openStart = 0;
  let openEnd = 0;
  const roots: Record<string, readonly Descendant[]> = {};
  const rootNamesBySource = new Map<string, Map<string, string>>();
  const reservedRoots = new Set<string>();
  let previous: {
    join: number | null;
    ownerKey: string | null;
    root: string;
  } | null = null;
  for (const segment of viewSelection.segments.parts) {
    const fragment = segment.fragment
      ? readAuthoredViewFragments(editor, segment.fragment.changeId).find(
          (entry) => entry.id === segment.fragment?.id
        )
      : null;
    if (segment.fragment && (!fragment || fragment.kind === 'properties')) {
      return null;
    }
    const current = fragment
      ? createAuthoredFragmentView(editor, fragment)
      : editor;
    const slice = current.read((state) => {
      const rootChildren = {
        [segment.root]: readRootChildren(state, segment.root),
      };
      const anchor = resolvePliteViewBoundarySegmentEndpoint(
        rootChildren,
        segment,
        segment.start
      );
      const focus = resolvePliteViewBoundarySegmentEndpoint(
        rootChildren,
        segment,
        segment.end
      );
      if (!anchor || !focus) return null;
      if (RangeApi.isCollapsed({ anchor, focus })) {
        const paths = segment.nodes.flatMap((node) => {
          const element = !node.text && state.nodes.get(node.path)?.[0];
          return element &&
            NodeApi.isElement(element) &&
            state.schema.isVoid(element)
            ? [node.path]
            : [];
        });
        const [first, ...rest] = paths;
        return first
          ? state.slice.get({
              at: SelectionApi.nodes([first, ...rest], {
                root: segment.root === 'main' ? undefined : segment.root,
              }),
            })
          : ContentSlice.empty;
      }
      return state.slice.get({ at: { anchor, focus } });
    });
    if (!slice) return null;
    if (!slice.content.length) continue;
    const { openEnd: sliceOpenEnd, openStart: sliceOpenStart } = slice;
    const sourceKey = fragment
      ? `fragment:${fragment.changeId}:${fragment.id}`
      : 'current';
    let rootNames = rootNamesBySource.get(sourceKey);

    if (!rootNames) {
      rootNames = new Map();
      rootNamesBySource.set(sourceKey, rootNames);
    }
    const mapped = remapProjectedSourceSlice(
      current,
      slice,
      rootNames,
      reservedRoots
    );

    if (!mapped) return null;
    const { content: mappedContent } = mapped;
    Object.assign(roots, mapped.roots);
    const joinStart =
      fragment && fragment.kind !== 'properties'
        ? fragment.placement?.kind === 'text'
          ? fragment.slice.openStart
          : 0
        : null;
    const joinEnd =
      fragment && fragment.kind !== 'properties'
        ? fragment.placement?.kind === 'text'
          ? fragment.slice.openEnd
          : 0
        : null;
    if (content) {
      const depths = [previous?.join, joinStart].filter(
        (depth): depth is number => depth != null
      );
      const depth =
        previous?.root === segment.root &&
        previous.ownerKey === segment.ownerKey &&
        depths.length
          ? Math.min(...depths)
          : 0;
      content = joinSliceContent(content, mappedContent, depth);
    } else {
      content = mappedContent;
      openStart = sliceOpenStart;
    }
    openEnd = sliceOpenEnd;
    previous = {
      join: joinEnd,
      ownerKey: segment.ownerKey,
      root: segment.root,
    };
  }
  return content
    ? ContentSlice.fromJSON({
        content,
        openEnd,
        openStart,
        ...(Object.keys(roots).length > 0 ? { roots } : {}),
      })
    : null;
};

export const writeProjectedViewSelectionClipboardData = (
  editor: RuntimeEditor,
  data: Pick<DataTransfer, 'getData' | 'setData'>
) => {
  const slice = getProjectedViewSelectionSlice(editor);

  if (!slice || slice.content.length === 0) {
    return false;
  }

  const clipboardFormatKey = getProjectedClipboardFormatKey(editor);

  const runtimeEditor = getCanonicalRuntimeEditor(editor);
  const exported = exportContentSlice(runtimeEditor, slice);

  writeDOMHostFragmentData(runtimeEditor, data, {
    clipboardFormatKey,
    html: ({ text }) => `<span>${escapeHtmlText(text)}</span>`,
    slice: exported,
  });

  return true;
};
