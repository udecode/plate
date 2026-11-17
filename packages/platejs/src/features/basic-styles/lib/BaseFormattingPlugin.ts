import {
  definePlugin,
  locateAt,
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  PathApi,
  PLUGINS,
  type Range,
  type NodeEntry,
  RangeApi,
  txLocate,
} from '../../../core';
import { definePluginPoint, getPluginContributions } from '../../../facade';

/** One block a `keeps` predicate judges, with the siblings it stands among. */
export type FormattingBlockEntry = Readonly<{
  index: number;
  node: Element;
  path: Path;
  siblings: readonly Descendant[];
}>;

/** A plugin's share of what clear formatting removes from blocks and keeps. */
export type FormattingContribution = Readonly<{
  /** Element properties that style a block, cleared on a fully covered block. */
  block?: readonly string[];
  /**
   * Per key, whether a block keeps it although it styles other blocks, such as
   * an indent that is list depth. A block keeps a key when any predicate does.
   */
  keeps?: Readonly<Record<string, (entry: FormattingBlockEntry) => boolean>>;
}>;

/**
 * Contribute the block properties clear formatting removes, and the blocks
 * that keep one. Text styles need no contribution: every text property whose
 * schema role is `content` is one.
 */
export const formatting =
  definePluginPoint<FormattingContribution>('formatting');

/**
 * Clear formatting: remove text styles inside a range, and block styles from
 * the blocks it fully covers, in one undo step. At a caret it removes only the
 * pending styles, so the next typed text is plain.
 */
export const BaseFormattingPlugin = definePlugin(PLUGINS.formatting, {
  update: ({ editor, tx }) => ({
    clear: txLocate(locateAt(0), (options: Readonly<{ at?: Range }> = {}) => {
      const target = options.at ?? tx.selection();

      if (!target) return;

      const blockSelection = !options.at && tx.selection.nodeMode() !== null;
      const roleAt = (key: string, parentPath: Path) => {
        const ancestors = Array.from(
          tx.nodes.levels({ at: parentPath, reverse: true })
        );
        const types = ancestors.flatMap(([node]) =>
          NodeApi.isElement(node) ? [node.type] : []
        );

        return tx.schema.property({
          ancestors: types.slice(1),
          key,
          placement: 'text',
          type: types[0],
        })?.role;
      };

      if (!blockSelection && RangeApi.isCollapsed(target)) {
        const marks = tx.marks();

        if (!marks) return;

        const parentPath = PathApi.parent(target.anchor.path);

        tx.marks.set(
          Object.fromEntries(
            Object.entries(marks).filter(
              ([key]) => roleAt(key, parentPath) !== 'content'
            )
          )
        );
        return;
      }

      const contributions = getPluginContributions(editor, formatting);
      const blockKeys = [
        ...new Set(contributions.flatMap((entry) => entry.block ?? [])),
      ];
      const keeps = contributions.flatMap((entry) =>
        Object.entries(entry.keeps ?? {})
      );
      const covered = blockSelection
        ? tx.nodes.blocks({ coverage: 'full' })
        : tx.nodes.blocks({ at: target, coverage: 'full' });
      const selectedEntries = blockSelection
        ? tx.selection.nodes().toSorted(([, a], [, b]) => PathApi.compare(a, b))
        : [];
      const selected = new Set(
        selectedEntries.map(([, path]) => path.join(','))
      );
      const isInside = (path: Path) =>
        !blockSelection ||
        path.some((_, depth) =>
          selected.has(path.slice(0, depth + 1).join(','))
        );
      const regionOf = (entries: readonly NodeEntry[]) => {
        const first = entries.at(0);
        const last = entries.at(-1);

        if (!first || !last) return undefined;

        const hasText = ([node]: NodeEntry) => !NodeApi.texts(node).next().done;

        return hasText(first) && hasText(last)
          ? tx.ranges.get(first[1], last[1])
          : PathApi.common(first[1], last[1]);
      };
      const textAt = blockSelection ? regionOf(selectedEntries) : target;
      const isStyledText = (node: Descendant, path: Path) => {
        if (!NodeApi.isText(node) || !isInside(path)) return false;

        const [parent] = tx.nodes.parent(path) ?? [];

        return (
          !!parent &&
          NodeApi.isElement(parent) &&
          (!tx.schema.isVoid(parent) || tx.schema.isMarkableVoid(parent))
        );
      };

      if (textAt) {
        const uniform = new Set<string>();
        const contextual = new Set<string>();

        for (const [text] of tx.nodes.entries({
          at: textAt,
          match: (node, path) => NodeApi.isText(node) && isInside(path),
          voids: true,
        })) {
          for (const key of Object.keys(text)) {
            if (key === 'text') continue;

            const property = tx.schema.property({ key, placement: 'text' });

            if (!property) contextual.add(key);
            else if (property.role === 'content') uniform.add(key);
          }
        }

        const anchor = blockSelection
          ? undefined
          : tx.anchor(target, { association: 'inward', deletion: 'nearest' });
        const unset = (
          keys: readonly string[],
          match: (node: Descendant, path: Path) => boolean
        ) => {
          if (keys.length === 0) return;
          if (!anchor) {
            tx.nodes.unset([...keys], {
              at: textAt,
              hanging: true,
              match,
              voids: true,
            });
            return;
          }

          const at = anchor.resolve();

          if (!at) return;

          tx.nodes.unset([...keys], { at, match, split: true, voids: true });

          const after = anchor.resolve();

          for (const point of after ? RangeApi.edges(after) : []) {
            const [edge] = tx.nodes.get(point.path) ?? [];

            if (
              point.offset > 0 &&
              edge &&
              NodeApi.isText(edge) &&
              point.offset < edge.text.length &&
              keys.some((key) => key in edge) &&
              match(edge, point.path)
            ) {
              tx.nodes.unset([...keys], { at: point.path, match, voids: true });
            }
          }
        };

        unset([...uniform], isStyledText);

        for (const key of contextual) {
          unset(
            [key],
            (node, path) =>
              isStyledText(node, path) &&
              roleAt(key, PathApi.parent(path)) === 'content'
          );
        }
      }

      const blockAt = regionOf(covered);

      const writes = new Map<string, { keys: string[]; paths: Set<string> }>();
      const siblingsOf = new Map<string, readonly Descendant[]>();

      for (const [node, path] of blockAt ? covered : []) {
        const parentPath = PathApi.parent(path);
        const parentKey = parentPath.join(',');
        const siblings =
          siblingsOf.get(parentKey) ?? tx.nodes.children(parentPath);
        const index = path.at(-1) ?? 0;

        siblingsOf.set(parentKey, siblings);

        const keys = blockKeys.filter(
          (key) =>
            key in node &&
            !keeps.some(
              ([keptKey, keep]) =>
                keptKey === key && keep({ index, node, path, siblings })
            )
        );

        if (keys.length === 0) continue;

        const group = JSON.stringify(keys);
        const write = writes.get(group) ?? { keys, paths: new Set() };

        write.paths.add(path.join(','));
        writes.set(group, write);
      }

      for (const { keys, paths } of writes.values()) {
        tx.nodes.unset(keys, {
          at: blockAt,
          hanging: true,
          match: (_node, path) => paths.has(path.join(',')),
          mode: 'all',
        });
      }
    }),
  }),
});
