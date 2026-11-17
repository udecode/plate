import {
  BaseParagraphPlugin,
  definePlugin,
  locateAt,
  type Descendant,
  type Element,
  type Location,
  NodeApi,
  type Path,
  PathApi,
  PLUGINS,
  type Range,
  type NodeEntry,
  RangeApi,
  type Text,
  txLocate,
} from '../../../core';
import {
  definePluginPoint,
  getPluginContributions,
  landNodePropertiesAt,
  MAIN_ROOT_KEY,
  vetoesWrite,
} from '../../../facade';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';

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
   * The key `type` keeps a block's type and heading level, such as a list
   * item's: `read.capture` leaves them out of the look, and `update.apply`
   * leaves them unchanged.
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

declare const capturedFormatBrand: unique symbol;

/**
 * The look `read.capture` took from a range, for `update.apply`. It is
 * opaque: pass it back, never read it.
 */
export interface CapturedFormat {
  readonly [capturedFormatBrand]: true;
}

type BlockIdentity =
  | Readonly<{ kind: 'heading'; level: number }>
  | Readonly<{ kind: 'paragraph' }>;

type FormatData = Readonly<{
  block: Readonly<{
    identity: BlockIdentity | null;
    settings: Readonly<Record<string, unknown>>;
  }> | null;
  text: Readonly<Record<string, unknown>>;
}>;

const capturedFormats = new WeakMap<CapturedFormat, FormatData>();

class CapturedFormatHandle {}

const toCapturedFormat = (data: FormatData) => {
  const format = Object.freeze(new CapturedFormatHandle()) as CapturedFormat;

  capturedFormats.set(format, data);

  return format;
};

const pathKey = (path: Path) => path.join(',');

const isWithin = (paths: ReadonlySet<string>) => (path: Path) =>
  path.some((_, depth) => paths.has(pathKey(path.slice(0, depth + 1))));

type TextTarget = Readonly<{ at: Location; resolve?: () => Range | null }>;

type TextMatch = (node: Descendant, path: Path) => boolean;

/**
 * Clear formatting: remove text styles inside a range, and block styles from
 * the blocks it fully covers, in one undo step. At a caret it removes only the
 * pending styles, so the next typed text is plain. Capture and apply copy the
 * look of one range onto another, as a format painter does.
 */
export const BaseFormattingPlugin = definePlugin(PLUGINS.formatting, {
  read: ({ editor, state }) => ({
    /**
     * Take the look at the start of a range, the selection by default: the
     * content properties of its first selected text and, when the range
     * covers that text's whole block, the block's settings and its paragraph
     * or heading type. Returns undefined when the range selects no text.
     */
    capture: (
      options: Readonly<{ at?: Range }> = {}
    ): CapturedFormat | undefined => {
      const source = options.at ?? state.selection();

      if (!source || !RangeApi.isRange(source)) return undefined;

      const start = RangeApi.start(source);
      const collapsed = RangeApi.isCollapsed(source);
      const first = state.nodes
        .entries({
          at: source,
          match: (node, path) => {
            if (!NodeApi.isText(node)) return false;
            if (
              !collapsed &&
              PathApi.equals(path, start.path) &&
              start.offset === node.text.length
            ) {
              return false;
            }

            const [parent] = state.nodes.parent(path) ?? [];

            return (
              !!parent &&
              NodeApi.isElement(parent) &&
              (!state.schema.isVoid(parent) ||
                state.schema.isMarkableVoid(parent))
            );
          },
          voids: true,
        })
        .next().value;

      if (!first || !NodeApi.isText(first[0])) return undefined;

      const [leaf, leafPath] = first;
      const types = Array.from(
        state.nodes.levels({ at: PathApi.parent(leafPath), reverse: true })
      ).flatMap(([node]) => (NodeApi.isElement(node) ? [node.type] : []));
      const text = Object.fromEntries(
        Object.entries(leaf).filter(
          ([key]) =>
            key !== 'text' &&
            state.schema.property({
              ancestors: types.slice(1),
              key,
              placement: 'text',
              type: types[0],
            })?.role === 'content'
        )
      );
      const covered = state.nodes
        .blocks({ at: source, coverage: 'full', mode: 'lowest' })
        .find(([, path]) => PathApi.isAncestor(path, leafPath));

      if (!covered) return toCapturedFormat({ block: null, text });

      const [block, blockPath] = covered;
      const contributions = getPluginContributions(editor, formatting);
      const entry = {
        index: blockPath.at(-1) ?? 0,
        node: block,
        path: blockPath,
        siblings: state.nodes.children(PathApi.parent(blockPath)),
      };
      const kept = (key: string) =>
        contributions.some((contribution) =>
          contribution.keeps?.[key]?.(entry)
        );
      const settings = Object.fromEntries(
        [
          ...new Set(
            contributions.flatMap((contribution) => contribution.block ?? [])
          ),
        ]
          .filter((key) => key in block && !kept(key))
          .map((key) => [key, block[key]])
      );
      const heading = getCompiledPlatePlugin(editor, PLUGINS.heading);
      const identity = kept('type')
        ? null
        : block.type === editor.plugin(BaseParagraphPlugin).schema.type
          ? { kind: 'paragraph' as const }
          : heading &&
              block.type === editor.plugin(heading).schema.type &&
              typeof block.level === 'number'
            ? { kind: 'heading' as const, level: block.level }
            : null;

      return toCapturedFormat({ block: { identity, settings }, text });
    },
  }),
  update: ({ editor, tx }) => {
    const typesAt = (path: Path) =>
      Array.from(tx.nodes.levels({ at: path, reverse: true })).flatMap(
        ([node]) => (NodeApi.isElement(node) ? [node.type] : [])
      );
    const textRole = (key: string, types: readonly string[]) =>
      tx.schema.property({
        ancestors: types.slice(1),
        key,
        placement: 'text',
        type: types[0],
      })?.role;
    const roleAt = (key: string, parentPath: Path) =>
      textRole(key, typesAt(parentPath));
    const keepRules = () => {
      const contributions = getPluginContributions(editor, formatting);

      return {
        blockKeys: [
          ...new Set(contributions.flatMap((entry) => entry.block ?? [])),
        ],
        keeps: contributions.flatMap((entry) =>
          Object.entries(entry.keeps ?? {})
        ),
      };
    };
    const regionOf = (entries: readonly NodeEntry[]) => {
      const first = entries.at(0);
      const last = entries.at(-1);

      if (!first || !last) return undefined;

      const hasText = ([node]: NodeEntry) => !NodeApi.texts(node).next().done;

      return hasText(first) && hasText(last)
        ? tx.ranges.get(first[1], last[1])
        : PathApi.common(first[1], last[1]);
    };
    const toEntries = (blocks: ReadonlyArray<NodeEntry<Element>>) => {
      const siblingsOf = new Map<string, readonly Descendant[]>();

      return blocks.map(([node, path]): FormattingBlockEntry => {
        const parentPath = PathApi.parent(path);
        const parentKey = pathKey(parentPath);
        const siblings =
          siblingsOf.get(parentKey) ?? tx.nodes.children(parentPath);

        siblingsOf.set(parentKey, siblings);

        return { index: path.at(-1) ?? 0, node, path, siblings };
      });
    };
    const isStyledText =
      (isInside: (path: Path) => boolean): TextMatch =>
      (node, path) => {
        if (!NodeApi.isText(node) || !isInside(path)) return false;

        const [parent] = tx.nodes.parent(path) ?? [];

        return (
          !!parent &&
          NodeApi.isElement(parent) &&
          (!tx.schema.isVoid(parent) || tx.schema.isMarkableVoid(parent))
        );
      };
    const patchTexts = (
      target: TextTarget,
      match: TextMatch,
      write: (
        options: Readonly<{
          at: Location;
          hanging?: boolean;
          match: TextMatch;
          split?: boolean;
          voids: true;
        }>
      ) => void,
      pending: (text: Text) => boolean
    ) => {
      if (!target.resolve) {
        write({ at: target.at, hanging: true, match, voids: true });
        return;
      }

      const at = target.resolve();

      if (!at) return;

      write({ at, match, split: true, voids: true });

      const after = target.resolve();
      const unsplitEdges = (after ? RangeApi.edges(after) : []).filter(
        (point) => {
          const [edge] = tx.nodes.get(point.path) ?? [];

          return (
            point.offset > 0 &&
            !!edge &&
            NodeApi.isText(edge) &&
            point.offset < edge.text.length &&
            pending(edge) &&
            match(edge, point.path)
          );
        }
      );

      for (const point of unsplitEdges) {
        write({ at: point.path, match, voids: true });
      }
    };
    const clearTexts = (
      target: TextTarget,
      isInside: (path: Path) => boolean
    ) => {
      const styled = isStyledText(isInside);
      const uniform = new Set<string>();
      const contextual = new Set<string>();

      for (const [text] of tx.nodes.entries({
        at: target.at,
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

      const unset = (keys: readonly string[], match: TextMatch) => {
        if (keys.length === 0) return;

        patchTexts(
          target,
          match,
          (options) => tx.nodes.unset([...keys], options),
          (text) => keys.some((key) => key in text)
        );
      };

      unset([...uniform], styled);

      for (const key of contextual) {
        unset(
          [key],
          (node, path) =>
            styled(node, path) &&
            roleAt(key, PathApi.parent(path)) === 'content'
        );
      }
    };
    const clearBlocks = (entries: readonly FormattingBlockEntry[]) => {
      const blockAt = regionOf(entries.map(({ node, path }) => [node, path]));

      if (!blockAt) return;

      const { blockKeys, keeps } = keepRules();
      const writes = new Map<string, { keys: string[]; paths: Set<string> }>();

      for (const entry of entries) {
        const keys = blockKeys.filter(
          (key) =>
            key in entry.node &&
            !keeps.some(([keptKey, keep]) => keptKey === key && keep(entry))
        );

        if (keys.length === 0) continue;

        const group = JSON.stringify(keys);
        const write = writes.get(group) ?? { keys, paths: new Set() };

        write.paths.add(pathKey(entry.path));
        writes.set(group, write);
      }

      for (const { keys, paths } of writes.values()) {
        tx.nodes.unset(keys, {
          at: blockAt,
          hanging: true,
          match: (_node, path) => paths.has(pathKey(path)),
          mode: 'all',
        });
      }
    };

    return {
      /**
       * Copy a look `read.capture` took onto a range, the selection by
       * default, in one new undo step. The range is cleared as `clear` does,
       * except that its blocks keep their settings unless the look came from
       * a whole block, and then takes the look's text properties. When the
       * look came from a whole block, each block the range fully covers takes
       * its settings, and a whole paragraph or heading takes its paragraph or
       * heading type where the schema allows. Returns false and changes
       * nothing when the format is not one `capture` returned, or when the
       * range is missing, collapsed or a block selection.
       */
      apply: txLocate(
        locateAt(1),
        (format: CapturedFormat, options: Readonly<{ at?: Range }> = {}) => {
          const data = capturedFormats.get(format);
          const target = options.at ?? tx.selection();

          if (
            !data ||
            !target ||
            (!options.at && tx.selection.nodeMode() !== null) ||
            RangeApi.isCollapsed(target)
          ) {
            return false;
          }

          tx.history.newBatch();

          const anchor = tx.anchor(target, {
            association: 'inward',
            deletion: 'nearest',
          });
          const textTarget = { at: target, resolve: () => anchor.resolve() };
          const entries = data.block
            ? toEntries(
                tx.nodes.blocks({
                  at: target,
                  coverage: 'full',
                  mode: 'lowest',
                })
              )
            : [];

          clearTexts(textTarget, () => true);
          clearBlocks(entries);

          const blockAt = regionOf(
            entries.map(({ node, path }) => [node, path])
          );
          const { keeps } = keepRules();
          const kept = (key: string, entry: FormattingBlockEntry) =>
            keeps.some(([keptKey, keep]) => keptKey === key && keep(entry));
          const ancestorTypesOf = new Map<string, readonly string[]>();
          const ancestorTypes = (path: Path) => {
            const parentPath = PathApi.parent(path);
            const key = pathKey(parentPath);
            const known = ancestorTypesOf.get(key);

            if (known) return known;

            const types = typesAt(parentPath);

            ancestorTypesOf.set(key, types);

            return types;
          };
          const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
          const heading = getCompiledPlatePlugin(editor, PLUGINS.heading);
          const headingType = heading
            ? editor.plugin(heading).schema.type
            : undefined;
          const identity = data.block?.identity;
          const destination =
            identity?.kind === 'paragraph'
              ? { type: paragraphType }
              : identity?.kind === 'heading' && headingType
                ? { level: identity.level, type: headingType }
                : null;
          const root = tx.view.root() ?? MAIN_ROOT_KEY;
          const retyped = new Set<string>();

          if (data.block && blockAt) {
            const shape = (type: string) => {
              const element = tx.schema.element(type);

              return (
                element &&
                JSON.stringify([
                  element.behavior,
                  element.content,
                  element.contentRoots,
                  element.groups,
                  element.structure,
                ])
              );
            };
            const destinationShape = destination && shape(destination.type);
            const writes = new Map<
              string,
              { paths: Set<string>; props: Readonly<Record<string, unknown>> }
            >();

            for (const entry of entries) {
              const live = tx.nodes.get(entry.path)?.[0];

              if (!NodeApi.isElement(live)) continue;

              const retype =
                destination &&
                (live.type === paragraphType || live.type === headingType) &&
                (live.type !== destination.type ||
                  live.level !== destination.level) &&
                !kept('type', entry) &&
                shape(live.type) === destinationShape &&
                (live.type === destination.type ||
                  !vetoesWrite(editor, {
                    kind: 'retype',
                    node: live,
                    path: entry.path,
                    root,
                    type: destination.type,
                  }))
                  ? destination
                  : undefined;
              const props = landNodePropertiesAt(
                tx.schema,
                {
                  properties: Object.fromEntries(
                    Object.entries(data.block.settings).filter(
                      ([key]) => !kept(key, entry)
                    )
                  ),
                  retype,
                },
                entry.path,
                { root }
              );

              if (Object.keys(props).length === 0) continue;
              if (props.type !== undefined && props.type !== live.type) {
                retyped.add(pathKey(entry.path));
              }

              const group = JSON.stringify(props);
              const write = writes.get(group) ?? { paths: new Set(), props };

              write.paths.add(pathKey(entry.path));
              writes.set(group, write);
            }

            for (const { paths, props } of writes.values()) {
              tx.nodes.set(props, {
                at: blockAt,
                hanging: true,
                match: (_node, path) => paths.has(pathKey(path)),
                mode: 'all',
              });
            }
          }

          if (retyped.size > 0) clearTexts(textTarget, isWithin(retyped));

          const styled = isStyledText(() => true);
          const looks = new Map<string, Readonly<Record<string, unknown>>>();
          const lookAt = (path: Path) => {
            const types = ancestorTypes(path);
            const chain = types.join('\u0000');
            const known = looks.get(chain);

            if (known) return known;

            const look = Object.fromEntries(
              Object.entries(data.text).filter(
                ([key]) => textRole(key, types) === 'content'
              )
            );

            looks.set(chain, look);

            return look;
          };
          const signature = (props: Readonly<Record<string, unknown>>) =>
            JSON.stringify(
              Object.entries(props).toSorted(([left], [right]) =>
                left.localeCompare(right)
              )
            );
          const landedBy = new WeakMap<Descendant, string>();
          const queue: Array<Readonly<Record<string, unknown>>> = [];
          const queued = new Set<string>();
          const landedAt = (node: Descendant, path: Path) => {
            const known = landedBy.get(node);

            if (known !== undefined) return known;

            const landed = landNodePropertiesAt(
              tx.schema,
              { properties: lookAt(path) },
              path,
              { root }
            );
            const id = signature(landed);

            if (Object.keys(landed).length > 0 && !queued.has(id)) {
              queued.add(id);
              queue.push(landed);
            }
            landedBy.set(node, id);

            return id;
          };

          const painted = anchor.resolve();

          if (painted) {
            for (const [node, path] of tx.nodes.entries({
              at: painted,
              match: (candidate, at): candidate is Text =>
                NodeApi.isText(candidate) && styled(candidate, at),
              voids: true,
            })) {
              landedAt(node, path);
            }
          }

          for (const props of queue) {
            const id = signature(props);
            const keys = Object.keys(props);

            patchTexts(
              textTarget,
              (node, path) => styled(node, path) && landedAt(node, path) === id,
              (writeOptions) => tx.nodes.set(props, writeOptions),
              (text) => keys.some((key) => !(key in text))
            );
          }

          return true;
        }
      ),
      clear: txLocate(locateAt(0), (options: Readonly<{ at?: Range }> = {}) => {
        const target = options.at ?? tx.selection();

        if (!target) return;

        const blockSelection = !options.at && tx.selection.nodeMode() !== null;

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

        const covered = blockSelection
          ? tx.nodes.blocks({ coverage: 'full' })
          : tx.nodes.blocks({ at: target, coverage: 'full' });
        const selectedEntries = blockSelection
          ? tx.selection
              .nodes()
              .toSorted(([, a], [, b]) => PathApi.compare(a, b))
          : [];
        const textAt = blockSelection ? regionOf(selectedEntries) : target;

        if (textAt) {
          const anchor = blockSelection
            ? undefined
            : tx.anchor(target, {
                association: 'inward',
                deletion: 'nearest',
              });

          clearTexts(
            {
              at: textAt,
              resolve: anchor ? () => anchor.resolve() : undefined,
            },
            blockSelection
              ? isWithin(
                  new Set(selectedEntries.map(([, path]) => pathKey(path)))
                )
              : () => true
          );
        }

        clearBlocks(toEntries(covered));
      }),
    };
  },
});
