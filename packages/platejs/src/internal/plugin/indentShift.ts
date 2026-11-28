import type { Editor } from '../../core';
import {
  definePluginPoint,
  getPluginContributions,
  hasNonWritableAt,
  PointApi,
  RangeApi,
  SelectionApi,
  type EditorUpdateTransaction,
  type Element,
  type Location,
  type NodeEntry,
  type NodeKey,
  type NodeSelection,
  type Path,
  type Range,
  type Selection,
} from '../../facade';
import { PLUGINS } from '../../utils/plate-keys';
import { getCompiledPlatePlugin } from './compilePlateModel';

/** Planned indentation shift owned by a plugin contributor for one transaction. */
export type IndentShiftPlan = Readonly<{
  /** Runs the contributor's planned writes and reports whether anything changed. */
  apply: (tx: EditorUpdateTransaction) => boolean;
  /**
   * Every block key claimed by this contributor (including blocked family
   * members so generic indent never shifts a blocked family's children).
   */
  claimed: ReadonlySet<NodeKey>;
}>;

/** Context supplied to `indentShift` contributors before any indent write. */
export type IndentShiftContext = Readonly<{
  editor: Editor;
  entries: ReadonlyArray<NodeEntry<Element>>;
  indentMax: number | null;
  offset: 1 | -1;
  root: string | undefined;
  tx: EditorUpdateTransaction;
}>;

/**
 * Private plugin point letting plugins such as `BaseListPlugin` participate in
 * `BaseIndentPlugin.update.increase/decrease` in a single family plan per
 * transaction without adding an Indent -> List entrypoint dependency.
 */
export const indentShift =
  definePluginPoint<(context: IndentShiftContext) => IndentShiftPlan | null>(
    'indent-shift'
  );

/** Reads all registered `indentShift` contributors for `editor`. */
export const getIndentShiftContributors = (editor: Editor) =>
  getPluginContributions(editor, indentShift);

/** Resolves the document root targeted by `at`, falling back to `selection` and `fallbackRoot`. */
export const resolveTargetRoot = (
  at: Location | NodeSelection | undefined,
  fallbackRoot: string | undefined,
  selection?: Range | Selection | null
): string | undefined => {
  if (at !== undefined) {
    if (SelectionApi.isNode(at) || RangeApi.isRange(at)) {
      return SelectionApi.root(at) ?? fallbackRoot;
    }
    if (PointApi.isPoint(at)) {
      return at.root ?? fallbackRoot;
    }

    return fallbackRoot;
  }

  return (selection ? SelectionApi.root(selection) : undefined) ?? fallbackRoot;
};

/** Builds a block node selection rooted to `root` when present. */
export const rootedBlockSelection = (path: Path, root: string | undefined) =>
  SelectionApi.nodes([path], {
    mode: 'block',
    ...(root ? { root } : {}),
  });

/**
 * Rooted non-writable check for a block path inside `tx` / `state` where bare
 * paths would otherwise resolve against `'main'` on named-root updates.
 */
export const hasNonWritableBlock = (
  editor: Editor,
  path: Path,
  root: string | undefined,
  { descendants = false }: Readonly<{ descendants?: boolean }> = {}
) =>
  descendants
    ? hasNonWritableAt(editor, rootedBlockSelection(path, root))
    : hasNonWritableAt(editor, {
        offset: 0,
        path,
        ...(root ? { root } : {}),
      });

/** Returns `true` when the active view selection includes a code block. */
export const selectsCodeBlock = (editor: Editor) => {
  const descriptor = getCompiledPlatePlugin(editor, PLUGINS.codeBlock);
  const pluginSchema = descriptor
    ? editor.plugin(descriptor).schema
    : undefined;
  const codeBlockType =
    pluginSchema && 'type' in pluginSchema ? pluginSchema.type : undefined;

  return (
    codeBlockType !== undefined &&
    editor.read.nodes.some({ type: codeBlockType })
  );
};
