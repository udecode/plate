import {
  type Descendant,
  type Element,
  ElementApi,
  type Location,
  type Node,
  type NodeEntry,
  type Path,
  type Point,
  RangeApi,
} from '@platejs/slate';

type RuntimeReadableEditor = {
  api?: Record<string, any>;
  children?: Descendant[];
  read?: <T>(fn: (state: any) => T) => T;
  selection?: any;
  tf?: Record<string, any>;
  update?: (fn: (tx: any) => void, options?: any) => void;
};

const hasApi = <T extends string>(
  editor: RuntimeReadableEditor,
  key: T
): editor is RuntimeReadableEditor & {
  api: Record<T, (...args: any[]) => any>;
} => typeof editor.api?.[key] === 'function';

export const isEditorSelectionCollapsed = (
  editor: RuntimeReadableEditor
): boolean => {
  if (hasApi(editor, 'isCollapsed')) return editor.api.isCollapsed();

  const selection =
    editor.selection ?? editor.read?.((state) => state.selection.get());

  return !!selection && RangeApi.isCollapsed(selection);
};

const getLocationStartPoint = (
  editor: RuntimeReadableEditor,
  at: Location
): Point =>
  RangeApi.isRange(at)
    ? RangeApi.start(at)
    : 'offset' in at
      ? at
      : editor.read!((state) => state.points.start(at));

export const getEditorRange = (
  editor: RuntimeReadableEditor,
  at: Location | 'before' | 'start',
  to?: Location
) => {
  if (at === 'start') {
    if (!to) return;
    if (!editor.read && hasApi(editor, 'range'))
      return editor.api.range(at, to);

    const focus = getLocationStartPoint(editor, to);
    const blockEntry = getEditorBlock(editor, { at: focus });
    const anchor = blockEntry
      ? editor.read!((state) => state.points.start(blockEntry[1]))
      : editor.read!((state) => state.points.start([]));

    return {
      anchor,
      focus,
    };
  }

  if (at === 'before') {
    if (!to) return;
    if (!editor.read && hasApi(editor, 'range'))
      return editor.api.range(at, to);

    const before = getEditorPointBefore(editor, to);
    const focus = getLocationStartPoint(editor, to);

    return before
      ? {
          anchor: before,
          focus,
        }
      : undefined;
  }

  if (hasApi(editor, 'range')) return editor.api.range(at, to);

  return editor.read!((state) => state.ranges.get(at, to));
};

export const getEditorString = (
  editor: RuntimeReadableEditor,
  at: Location,
  options?: Record<string, unknown>
): string => {
  if (hasApi(editor, 'string')) return editor.api.string(at, options);

  return editor.read!((state) => state.text.string(at, options));
};

export const getEditorPointAfter = (
  editor: RuntimeReadableEditor,
  at: Location,
  options?: Record<string, unknown>
): Point | undefined => {
  if (hasApi(editor, 'after')) return editor.api.after(at, options);

  return editor.read!((state) => state.points.after(at, options));
};

export const getEditorPointBefore = (
  editor: RuntimeReadableEditor,
  at: Location,
  options?: Record<string, unknown> & {
    afterMatch?: boolean;
    matchString?: string;
    skipInvalid?: boolean;
  }
): Point | undefined => {
  const matchString = options?.matchString;

  if (matchString && editor.read) {
    const targetPoint = getLocationStartPoint(editor, at);
    const blockEntry = getEditorBlock(editor, { at: targetPoint });
    const blockStart = blockEntry
      ? editor.read!((state) => state.points.start(blockEntry[1]))
      : targetPoint;
    const beforeRange = { anchor: blockStart, focus: targetPoint };
    const beforeText = getEditorString(editor, beforeRange);
    const matchIndex = beforeText.lastIndexOf(matchString);

    if (matchIndex < 0) return;

    return {
      path: targetPoint.path,
      offset: matchIndex + (options?.afterMatch ? matchString.length : 0),
    };
  }

  if (hasApi(editor, 'before')) return editor.api.before(at, options);

  return editor.read!((state) => state.points.before(at, options));
};

export const getEditorPointEnd = (
  editor: RuntimeReadableEditor,
  at: Location
): Point => {
  if (hasApi(editor, 'end')) return editor.api.end(at);

  return editor.read!((state) => state.points.end(at));
};

export const getEditorNode = <T extends Node = Node>(
  editor: RuntimeReadableEditor,
  at: Location
): NodeEntry<T> | undefined => {
  if (hasApi(editor, 'node')) return editor.api.node(at) as NodeEntry<T>;

  return editor.read?.((state) => state.nodes.get(at)) as
    | NodeEntry<T>
    | undefined;
};

export const getEditorParent = <T extends Element = Element>(
  editor: RuntimeReadableEditor,
  at: Location
): NodeEntry<T> | undefined => {
  if (hasApi(editor, 'parent')) return editor.api.parent(at) as NodeEntry<T>;

  return editor.read?.((state) => state.nodes.parent(at)) as
    | NodeEntry<T>
    | undefined;
};

export const getEditorBlock = <T extends Element = Element>(
  editor: RuntimeReadableEditor,
  options: Record<string, unknown>
): NodeEntry<T> | undefined => {
  if (hasApi(editor, 'block'))
    return editor.api.block(options) as NodeEntry<T> | undefined;

  return editor.read!((state) =>
    state.nodes.above({
      ...options,
      match: (node: unknown) =>
        ElementApi.isElement(node) && isEditorBlock(editor, node),
    })
  ) as NodeEntry<T> | undefined;
};

export const isEditorBlock = (
  editor: RuntimeReadableEditor,
  node: unknown
): node is Element => {
  if (!ElementApi.isElement(node)) return false;
  if (hasApi(editor, 'isBlock')) return editor.api.isBlock(node);

  return editor.read!((state) => state.schema.isBlock(node));
};

export const isEditorEnd = (
  editor: RuntimeReadableEditor,
  point: Point,
  at: Location
): boolean => {
  if (hasApi(editor, 'isEnd')) return editor.api.isEnd(point, at);

  return editor.read!((state) => state.points.isEnd(point, at));
};

export const findEditorPath = (
  editor: RuntimeReadableEditor,
  node: Descendant
): Path | undefined => {
  const path = editor.read?.(
    (state) =>
      state.nodes.find({
        at: [],
        match: (candidate: Node) => candidate === node,
        mode: 'all',
        voids: true,
      })?.[1]
  );

  if (path) return path;

  const findInChildren = (
    children: readonly Descendant[],
    parentPath: Path = []
  ): Path | undefined => {
    for (const [index, child] of children.entries()) {
      const childPath = [...parentPath, index];

      if (child === node) return childPath;

      if (ElementApi.isElement(child)) {
        const descendantPath = findInChildren(child.children, childPath);

        if (descendantPath) return descendantPath;
      }
    }
  };

  return editor.children ? findInChildren(editor.children) : undefined;
};

export const deleteEditorText = (
  editor: RuntimeReadableEditor,
  options?: { at?: Location }
) => {
  editor.update?.((tx) => {
    tx.text.delete(options);
  });
};
