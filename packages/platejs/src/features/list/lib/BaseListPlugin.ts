import {
  BaseParagraphPlugin,
  definePlugin,
  editorCommands,
  editorReads,
  ElementApi,
  getInjectMatch,
  locateAt,
  PLUGINS,
  property,
  schema,
  SelectionApi,
  target,
  txLocate,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  type DefinitionOf,
  type Descendant,
  type Element,
  type ElementWith,
  type Location,
  type NodeSelection,
  type NodeTarget,
  type Path,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { indentShift } from '../../../internal/plugin/indentShift';
import { formatting } from '../../basic-styles';
import { BaseIndentPlugin } from '../../indent';
import {
  applyListClear,
  applyListContinue,
  applyListRestart,
  applyListSet,
  applyListToggle,
} from './listCommands.internal';
import {
  deeperRunEnd,
  getListFamilies,
  isListFamilyMember,
  planListIndentShift,
} from './listFamily.internal';
import {
  decodeListHtmlProperties,
  encodeListHtml,
  prepareListHtmlDocument,
} from './listHtml.internal';
import { adoptListBlocks, joinInsertedListItem } from './listIdentity.internal';
import {
  applyListCommit,
  getElementListStyle,
  getHeadingType,
  isListItem,
  isListLevels,
  isListOrdinal,
  LIST_TYPES,
  listItemDepth,
  normalizeListStyle,
  readListOrdinal,
  type ListLevel,
  type ListLevels,
} from './listIndex.internal';
import {
  handleListDeleteBackward,
  handleListInsertBreak,
  handleListTab,
  handleListUntab,
  handleTaskModEnter,
} from './listKeyboard.internal';
import {
  decodeListMarkdown,
  encodeListPlainText,
} from './listMarkdown.internal';
import { landListPaste } from './listPaste.internal';
import { createListRules } from './listRules.internal';

export type { ListLevel, ListLevels };

/** Canonical list kind stored on `element.listType`. */
export type ListType = 'bulleted' | 'numbered' | 'task';

/** CSS `list-style-type` marker stored on `element.listStyle`. */
export type ListStyle =
  | 'disc'
  | 'circle'
  | 'square'
  | 'decimal'
  | 'decimal-leading-zero'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman'
  | (string & {});

/** Options for applying list formatting without toggling off. */
export type ListSetOptions = {
  at?: Location | NodeSelection;
  /** Explicit checked state when `type` is `'task'`; omitted preserves existing boolean or defaults to `false`. */
  checked?: boolean;
  /** Omitted preserves same-type `listStyle` (resets on cross-type conversion); `null` resets to default marker. */
  style?: ListStyle | null;
  type: ListType;
};

/** Options for toggling a list kind on or off. */
export type ListToggleOptions = {
  at?: Location | NodeSelection;
  type: ListType;
};

const DEFAULT_LIST_TARGET_PLUGINS = [
  BaseParagraphPlugin,
  PLUGINS.image,
] as const;

export const BaseListPlugin = definePlugin(PLUGINS.list, {
  contributions: [
    formatting.of({
      keeps: {
        indent: ({ index, siblings }) => isListFamilyMember(siblings, index),
        type: ({ index, siblings }) => isListFamilyMember(siblings, index),
      },
    }),
    indentShift.of(planListIndentShift),
  ],
  dependencies: [BaseIndentPlugin],
  schema: ({ targetElementTypes }) => ({
    properties: {
      checked: schema.elementProperty(property.boolean(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listStart: schema.elementProperty(
        property.number({
          validate: isListOrdinal,
          validationVersion: 1,
        }),
        {
          landing: 'adopt',
          split: 'drop',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listRestart: schema.elementProperty(
        property.number({
          validate: isListOrdinal,
          validationVersion: 1,
        }),
        {
          landing: 'adopt',
          split: 'drop',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listId: schema.elementProperty(property.string(), {
        landing: 'adopt',
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listLevels: schema.elementProperty(
        property.json({ validate: isListLevels, validationVersion: 1 }),
        {
          landing: 'adopt',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listStyle: schema.elementProperty(property.string(), {
        landing: 'adopt',
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listType: schema.elementProperty(property.enum(LIST_TYPES), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: DEFAULT_LIST_TARGET_PLUGINS,
  formats: ({ defineFormats }) =>
    defineFormats({
      html: [
        {
          createsElement: true,
          prepareDocument: (context) => prepareListHtmlDocument(context),
          decode: (context) => decodeListHtmlProperties(context),
          encode: (context) => encodeListHtml(context),
          match: [{ tag: 'li' }],
          priority: 50,
        },
        {
          decode: (context) => decodeListHtmlProperties(context),
          decodeOnly: true,
          match: [{ attributes: { 'data-list-type': true } }],
          priority: 40,
        },
      ],
    }),
  rules: {
    merge: {
      removeEmpty: ({ node }) => (isListItem(node) ? false : undefined),
    },
  },
})
  .extend(({ defineFormats }) => ({
    formats: defineFormats(BaseParagraphPlugin, {
      plainText: {
        priority: 40,
        encode: encodeListPlainText,
      },
      markdown: {
        node: 'list',
        priority: 40,
        decode: decodeListMarkdown,
      },
    }),
  }))
  .extend(({ editor }) => ({
    on: {
      commit({ commit }) {
        applyListCommit(editor, commit);
      },
    },
    read: ({ state }) => ({
      /**
       * Number shown for a numbered list item: its `listRestart`, or its count in
       * its list at its level, opened at its `listStart`, its level's `listLevels`
       * start, or 1. A shallower item of the list restarts deeper levels unless the
       * level's `restartAfter` says otherwise. Resolves `at` in this editor's root;
       * a known path skips node lookup. Returns `undefined` when `at` is not a
       * numbered list item there.
       */
      ordinal: (at: NodeTarget<Element>) => {
        const entry = state.nodes.get(at, { match: ElementApi.isElement });

        if (!entry) return undefined;

        return readListOrdinal(editor, state, entry[0], entry[1]);
      },
      isActive: ({
        style,
        type,
      }: {
        style?: ListStyle;
        type: ListType;
      }): boolean => {
        const selection = state.selection();

        if (!selection) return false;
        const normalizedStyle = normalizeListStyle(type, style);

        return state.nodes.some({
          match: (node) => {
            if (!ElementApi.isElement(node)) return false;

            return (
              node.listType === type &&
              (style === undefined ||
                getElementListStyle(node) === normalizedStyle)
            );
          },
        });
      },
    }),
  }))
  .extend(({ editor, plugin }) => ({
    override: {
      [PLUGINS.indent]: {
        targetPlugins: plugin.targetPlugins,
      },
    },
    // Each handler reads the editor the key reached: this plugin's own editor
    // misses the caret of the view that took the key.
    shortcuts: {
      tab: {
        handler: ({ editor: viewEditor }) => handleListTab(viewEditor),
        keys: 'tab',
        // After the table's cell navigation, and before generic indent.
        priority: 5,
      },
      toggleTask: {
        handler: ({ editor: viewEditor }) => handleTaskModEnter(viewEditor),
        keys: 'mod+enter',
        // Above ExitBreakPlugin (0) so Mod+Enter toggles tasks instead of
        // inserting a paragraph break.
        priority: 5,
      },
      untab: {
        handler: ({ editor: viewEditor }) => handleListUntab(viewEditor),
        keys: 'shift+tab',
        // After the table's cell navigation, and before generic indent and
        // the blockquote lift, which would strip a root item's depth.
        priority: 5,
      },
    },
    update: ({ tx }) => {
      const match = () => getInjectMatch(editor, plugin);
      const insertList = (
        { type }: { type: ListType },
        options: BlockInsertOptions
      ) => {
        const element = tx.schema.create(
          editor.plugin(BaseParagraphPlugin).schema.type,
          {
            indent: 1,
            listType: type,
            ...(type === 'task' ? { checked: false } : {}),
          }
        );

        if (!tx.blocks.insert(element, options)) return false;

        const entry = tx.nodes.get(element, { match: ElementApi.isElement });

        if (entry) joinInsertedListItem(tx, entry, getHeadingType(editor));

        return true;
      };
      const applyListInsertion = (
        mode: 'insert' | 'upsert',
        input: { type: ListType },
        options: BlockInsertOptions | BlockUpsertOptions = {}
      ) =>
        applyBlockInsertion({
          editor,
          insert: (insertOptions) => insertList(input, insertOptions),
          matches: (block) => block.listType === input.type,
          mode,
          options,
          tx,
        });

      return {
        clear: txLocate(
          locateAt(0),
          (options?: { at?: Location | NodeSelection }) =>
            applyListClear(editor, tx, match(), options)
        ),
        continue: txLocate(
          locateAt(0),
          (options?: { at?: Location | NodeSelection }) =>
            applyListContinue(editor, tx, options)
        ),
        insert: txLocate(
          locateAt(1, 'at', 'after', 'before'),
          (input: { type: ListType }, options: BlockInsertOptions = {}) =>
            applyListInsertion('insert', input, options)
        ),
        restart: txLocate(
          locateAt(0),
          (options?: { at?: Location | NodeSelection; start?: number }) =>
            applyListRestart(editor, tx, options)
        ),
        set: txLocate(locateAt(0), (options: ListSetOptions) =>
          applyListSet(editor, tx, match(), options)
        ),
        toggle: txLocate(locateAt(0), (options: ListToggleOptions) =>
          applyListToggle(editor, tx, match(), options)
        ),
        upsert: txLocate(
          locateAt(1, 'after', 'before'),
          (input: { type: ListType }, options: BlockUpsertOptions = {}) =>
            applyListInsertion('upsert', input, options)
        ),
      };
    },
  }))
  .extend(({ editor }) => ({
    readMiddleware: ({ around }) => [
      around(editorReads.slice.landing, ({ input, next, state }) =>
        landListPaste(state, input, next(), {
          headingType: getHeadingType(editor),
          paragraphType: editor.plugin(BaseParagraphPlugin).schema.type,
        })
      ),
      around(editorReads.transfer.adopt, ({ input, next, state }) =>
        adoptListBlocks(state, input, next(), {
          headingType: getHeadingType(editor),
        })
      ),
      around(editorReads.transfer.source, ({ next, state }) => {
        const selection = next();
        const entries = selection.paths.flatMap((path) => {
          const entry = state.nodes.get(path, { match: ElementApi.isElement });

          return entry ? [entry] : [];
        });

        return entries.some(([node]) => isListItem(node))
          ? SelectionApi.nodes(
              getListFamilies(state, entries).flatMap((family) =>
                family.map(({ path }) => path)
              ) as [Path, ...Path[]],
              { mode: 'block' }
            )
          : selection;
      }),
      around(editorReads.transfer.landing, ({ input, next, state }) => {
        const { edge, payload, target: landingTarget } = input;

        if (payload.kind !== 'nodes') return next();

        const [first] = payload.nodes;

        if (!first || !ElementApi.isElement(first) || !isListItem(first)) {
          return next();
        }

        const parent = landingTarget[1].slice(0, -1);
        const siblings = state.nodes.children(parent);
        const indent = listItemDepth(first);
        const moving = new Set<Descendant>(payload.nodes);
        let index =
          (landingTarget[1].at(-1) as number) + (edge === 'after' ? 1 : 0);
        let last = -1;

        while (index < siblings.length) {
          if (moving.has(siblings[index])) {
            index += 1;
            continue;
          }
          const end = deeperRunEnd(siblings, indent, index);

          if (end < 0) break;
          last = end;
          index = last + 1;
        }
        while (last >= 0 && moving.has(siblings[last])) last -= 1;

        const key = last >= 0 && state.key([...parent, last]);

        return key ? { edge: 'after' as const, key } : next();
      }),
    ],
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, next, state }) =>
        handleListDeleteBackward(editor, {
          direction: input.direction,
          next,
          state,
        })
      ),
      around(editorCommands.insertBreak, ({ next, state }) =>
        handleListInsertBreak(editor, { next, state })
      ),
    ],
  }))
  .extend({
    corrections: [
      {
        event: 'properties',
        correct({ entry: [node, path], tx }) {
          if (!ElementApi.isElement(node)) return;

          if (node.listType !== 'task' && Object.hasOwn(node, 'checked')) {
            tx.nodes.unset('checked', { at: path });
          }
          if (
            (node.listType === undefined || node.listType === 'task') &&
            Object.hasOwn(node, 'listStyle')
          ) {
            tx.nodes.unset('listStyle', { at: path });
          }
        },
      },
    ],
  });

/** Plugin definition type for `BaseListPlugin`. */
export type ListDefinition = DefinitionOf<typeof BaseListPlugin>;

const { BulletedListRules, OrderedListRules, TaskListRules } =
  createListRules(BaseListPlugin);

/** Markdown input rules for bulleted lists. */
export { BulletedListRules };
/** Markdown input rules for ordered lists. */
export { OrderedListRules };
/** Markdown input rules for task lists. */
export { TaskListRules };

/** Element carrying the Indent and List schema capabilities. */
export type ListElement = ElementWith<
  typeof BaseIndentPlugin | typeof BaseListPlugin,
  'indent' | 'listType'
>;
