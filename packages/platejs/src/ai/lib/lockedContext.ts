import {
  type Descendant,
  type Editor,
  type Element,
  ElementApi,
  NodeApi,
  type Path,
  PathApi,
  RangeApi,
  TextApi,
} from '../../core';
import { BaseTableCellPlugin, BaseTablePlugin } from '../../features/table';
import type { MarkdownEditor } from '../../markdown';
import type {
  AIChatRequestNodeRef,
  AIChatRequestRefs,
} from './AIChatRequestContext';
import {
  isAIPathNonWritable,
  resolveAISelectedBlocks,
} from './lockedContext.internal';

/**
 * Self-closing Markdown block tag emitted for locked blocks inside AI edit
 * prompts and parsed back at the Markdown AST stage.
 */
export const LOCKED_BLOCK_PLACEHOLDER_TAG = 'Locked';

const SELECTION_START = '<Selection>';
const SELECTION_END = '</Selection>';
const MAX_LOCKED_SUMMARY_CHARS = 240;

const getSelectedTableCells = (editor: Editor) => {
  const tablePlugin = editor.plugin(BaseTablePlugin);

  if (tablePlugin.installed) {
    const selected = tablePlugin.read.selection()?.cells ?? [];

    if (selected.length > 0) return selected;
  }

  if (!editor.read.selection()) return [];

  const tableEntry = editor.read.nodes.block({ type: BaseTablePlugin });

  if (!tableEntry) return [];

  return editor.read.nodes.toArray({ type: BaseTableCellPlugin });
};

/**
 * Return `true` when the active selection contains at least one writable block
 * or table cell that AI can edit in place.
 */
export const hasEditableAISelection = (
  editor: Editor,
  refs?: Partial<Pick<AIChatRequestRefs, 'lockedBlocks' | 'tableCells'>>
): boolean => {
  const selectedCells = getSelectedTableCells(editor);

  if (selectedCells.length > 1) {
    if (refs?.tableCells !== undefined) {
      return refs.tableCells.some(
        ({ path }) => !isAIPathNonWritable(editor, path)
      );
    }

    return selectedCells.some(([, path]) => !isAIPathNonWritable(editor, path));
  }

  const { entries, partialLockedContainer } = resolveAISelectedBlocks(editor);

  if (entries.length === 0 || partialLockedContainer) return false;

  const lockedPaths = new Set(
    (refs?.lockedBlocks ?? []).map(({ path }) => path.join(','))
  );

  return entries.some(
    ([, path]) =>
      !lockedPaths.has(path.join(',')) && !isAIPathNonWritable(editor, path)
  );
};

/** Result of serializing an AI multi-block edit context with locked placeholders. */
export type SerializedAIEditContext = Readonly<{
  /** Read-only plain-text summaries of each locked block, one per line. */
  lockedContext: string;
  /** Markdown prompt context with `<Locked ref="lN" />` replacing locked blocks. */
  markdown: string;
  /** Request-local locked block references in document order. */
  refs: readonly AIChatRequestNodeRef[];
}>;

const summarizeLockedBlock = (node: Element): string => {
  const normalized = NodeApi.string(node).replaceAll(/\s+/g, ' ').trim();

  if (!normalized) return '(empty locked block)';
  if (normalized.length <= MAX_LOCKED_SUMMARY_CHARS) return normalized;

  return `${normalized.slice(0, MAX_LOCKED_SUMMARY_CHARS - 3)}...`;
};

const serializeUnlockedRun = (
  editor: MarkdownEditor,
  nodes: readonly Element[]
): string => {
  if (nodes.length === 0) return '';

  const result = editor.api.markdown.serialize({
    document: { children: [...nodes] },
    lossPolicy: 'allow',
  });

  if (!result.ok) {
    throw new Error(
      result.diagnostics[0]?.message ?? 'Failed to serialize AI edit context.'
    );
  }

  return result.data.trim();
};

/**
 * Serialize the active selection for multi-block AI edits, replacing each
 * non-writable block with a request-local `<Locked ref="lN" />` placeholder
 * and collecting read-only `<locked-clauses>` context lines.
 */
export const serializeAIEditContext = (
  editor: MarkdownEditor,
  options: Readonly<{
    lockedBlocks?: readonly AIChatRequestNodeRef[];
  }> = {}
): SerializedAIEditContext => {
  const { entries } = resolveAISelectedBlocks(editor);
  const providedByPath = new Map(
    (options.lockedBlocks ?? []).map((entry) => [
      entry.path.join(','),
      entry.ref,
    ])
  );
  const usedRefs = new Set(providedByPath.values());
  let nextRefIndex = 1;
  const allocateRef = () => {
    while (usedRefs.has(`l${nextRefIndex}`)) {
      nextRefIndex += 1;
    }

    const ref = `l${nextRefIndex}`;

    usedRefs.add(ref);
    nextRefIndex += 1;

    return ref;
  };

  const parts: string[] = [];
  const lockedSummaries: string[] = [];
  const lockedRefs: AIChatRequestNodeRef[] = [];
  let unlockedRun: Element[] = [];

  const flushUnlocked = () => {
    if (unlockedRun.length === 0) return;

    const serialized = serializeUnlockedRun(editor, unlockedRun);

    if (serialized) parts.push(serialized);
    unlockedRun = [];
  };

  for (const [node, path] of entries) {
    const pathKey = path.join(',');
    const providedRef = providedByPath.get(pathKey);
    const locked =
      providedRef !== undefined || isAIPathNonWritable(editor, path);

    if (!locked) {
      unlockedRun.push(node);
      continue;
    }

    flushUnlocked();
    const ref = providedRef ?? allocateRef();

    lockedRefs.push({ path: [...path], ref });
    parts.push(`<${LOCKED_BLOCK_PLACEHOLDER_TAG} ref="${ref}" />`);
    lockedSummaries.push(
      `<${LOCKED_BLOCK_PLACEHOLDER_TAG} ref="${ref}" />: ${summarizeLockedBlock(node)}`
    );
  }

  flushUnlocked();

  return Object.freeze({
    lockedContext: lockedSummaries.join('\n'),
    markdown: parts.join('\n\n'),
    refs: Object.freeze(lockedRefs),
  });
};

const spliceSelectionInNode = (
  node: Descendant,
  relativePath: Path,
  offset: number,
  marker: string
): Descendant => {
  if (relativePath.length === 0) {
    if (!TextApi.isText(node)) return node;

    const clamped = Math.max(0, Math.min(offset, node.text.length));

    return {
      ...node,
      text: `${node.text.slice(0, clamped)}${marker}${node.text.slice(clamped)}`,
    };
  }

  if (!ElementApi.isElement(node)) return node;

  const [childIndex, ...rest] = relativePath;

  if (
    childIndex === undefined ||
    childIndex < 0 ||
    childIndex >= node.children.length
  ) {
    return node;
  }

  const nextChildren = node.children.map((child, index) =>
    index === childIndex
      ? spliceSelectionInNode(child, rest, offset, marker)
      : child
  );

  return {
    ...node,
    children: nextChildren,
  };
};

const unescapeSelectionMarkers = (
  editor: MarkdownEditor,
  text: string,
  includeSelectionMarkers: boolean
): string => {
  let output = text
    .replace(`\\${SELECTION_START}`, SELECTION_START)
    .replace(`\\${SELECTION_END}`, SELECTION_END);

  if (!includeSelectionMarkers || output.includes(SELECTION_END)) {
    return output;
  }

  const selection = editor.read.selection();

  if (!selection || RangeApi.isCollapsed(selection)) return output;

  const [, end] = RangeApi.edges(selection);
  const block = editor.read.nodes.block({ at: end.path });

  if (!block || !editor.read.schema.isVoid(block[0])) return output;

  const result = editor.api.markdown.serialize({
    document: { children: [block[0]] },
    lossPolicy: 'allow',
  });

  if (!result.ok) return output;

  const voidString = result.data;
  const idx = output.lastIndexOf(voidString);

  if (idx !== -1) {
    output =
      output.slice(0, idx) +
      voidString.trimEnd() +
      SELECTION_END +
      output.slice(idx + voidString.length);
  }

  return output;
};

/**
 * Serialize the active selection to Markdown without mutating the editor.
 * When `includeSelectionMarkers` is `true`, `<Selection>` and `</Selection>`
 * are spliced into a cloned JSON copy of the selected blocks so locked blocks
 * stay readable by single-block edit and generate prompts.
 */
export const serializeAISelectionMarkdown = (
  editor: MarkdownEditor,
  options: Readonly<{ includeSelectionMarkers?: boolean }> = {}
): string => {
  const { includeSelectionMarkers = false } = options;
  const entries = [...editor.read.nodes.blocks()];

  if (entries.length === 0) return '';

  const selection = editor.read.selection();
  const blocks: Element[] = entries.map(([node]) => structuredClone(node));

  if (includeSelectionMarkers && selection && RangeApi.isExpanded(selection)) {
    const [start, end] = RangeApi.edges(selection);
    const points = [
      { marker: SELECTION_END, point: end },
      { marker: SELECTION_START, point: start },
    ];

    for (const { marker, point } of points) {
      const entryIndex = entries.findIndex(
        ([, blockPath]) =>
          PathApi.equals(blockPath, point.path) ||
          PathApi.isAncestor(blockPath, point.path)
      );

      if (entryIndex === -1) continue;

      const entry = entries[entryIndex];
      const currentBlock = blocks[entryIndex];

      if (!entry || !currentBlock) continue;

      const relativePath = PathApi.relative(point.path, entry[1]);
      const updated = spliceSelectionInNode(
        currentBlock,
        relativePath,
        point.offset,
        marker
      );

      if (ElementApi.isElement(updated)) {
        blocks[entryIndex] = updated;
      }
    }
  }

  const result = editor.api.markdown.serialize({
    document: { children: blocks },
    lossPolicy: 'allow',
  });

  if (!result.ok) {
    throw new Error(
      result.diagnostics[0]?.message ?? 'Failed to serialize AI selection.'
    );
  }

  return unescapeSelectionMarkers(editor, result.data, includeSelectionMarkers);
};
