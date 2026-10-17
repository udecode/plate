'use client';

import { Fzf } from 'fzf';
import { PlusIcon } from 'lucide-react';
import {
  type Descendant,
  editorCommands,
  ElementApi,
  isHotkey,
  type Node,
  type Path,
  PathApi,
  type PluginTransaction,
  type Text,
  TextApi,
  txLocate,
} from 'platejs';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorContainerRef,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';

import { Editor, EditorContainer } from './editor';
import { TagElement, TagPlugin } from './tag';

export type SelectItem = { url?: string; value: string };

type Option = SelectItem & { create?: true };

const tagKey = (value: string) => value.toLowerCase();

const CREATE_MIN_LENGTH = 2;

const RECEIVE = 'select-editor-receive';
const CLEANUP = 'select-editor-cleanup';

const EMPTY_ITEMS: readonly SelectItem[] = [];

const FIRST_OPTION = { key: '', search: '' };

const HANDLED_NO_REFOCUS = { kind: 'none' } as const;

const isTag = (
  node: Node,
  type: string
): node is Node & { url?: string; value: string } =>
  ElementApi.isElementType(node, type) && typeof node.value === 'string';

const toItem = (node: { url?: string; value: string }): SelectItem => ({
  ...(node.url === undefined ? {} : { url: node.url }),
  value: node.value,
});

const isSearchText = (node: Node): node is Text =>
  TextApi.isText(node) && node.text.length > 0;

const removeStraySearch = (tx: PluginTransaction) => {
  const selection = tx.selection();
  const selected = selection
    ? Array.from(
        tx.nodes.entries({ at: selection, match: TextApi.isText })
      ).map(([, path]) => path)
    : [];
  const stray = (node: Node, path: Path) =>
    isSearchText(node) &&
    !selected.some((selectedPath) => PathApi.equals(selectedPath, path));

  if (tx.nodes.some({ at: [], match: stray })) {
    tx.nodes.remove({ at: [], match: stray });
  }
};

export const SelectTagPlugin = TagPlugin.extend(
  ({ editor, plugin, schema: { type } }) => ({
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        if (input.direction !== 'backward') return next();

        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          if (tx.nodes.some({ type: plugin })) {
            tx.selection.move();
          }
        });
      }),
    ],
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          if (isTag(node, type)) {
            const key = tagKey(node.value);
            const isDuplicate = (candidate: Node, candidatePath: Path) =>
              isTag(candidate, type) &&
              tagKey(candidate.value) === key &&
              !PathApi.equals(candidatePath, path);
            const hasEarlierDuplicate = tx.nodes.some({
              at: [],
              match: (candidate, candidatePath) =>
                isDuplicate(candidate, candidatePath) &&
                PathApi.isBefore(candidatePath, path),
            });

            if (hasEarlierDuplicate) {
              tx.nodes.remove({ at: path });
            } else {
              tx.nodes.remove({ at: [], match: isDuplicate });
            }

            return;
          }
          if (!isSearchText(node)) return;

          const leadingWhitespace =
            node.text.length - node.text.trimStart().length;
          const selection = tx.selection();

          if (leadingWhitespace > 0) {
            const selectionAnchor = selection
              ? tx.anchor(selection, {
                  association: 'inward',
                  deletion: 'nearest',
                })
              : null;

            tx.text.delete({
              at: {
                anchor: { offset: 0, path },
                focus: { offset: leadingWhitespace, path },
              },
            });

            const nextSelection = selectionAnchor?.resolve();

            if (nextSelection) tx.selection.set(nextSelection);
          }
          // A commit that moves the caret and types leaves the old search in
          // a leaf this correction never visits.
          if (selection) removeStraySearch(tx);
        },
      },
    ],
    on: {
      // A caret move commits no content, so no correction runs.
      commit({ commit }) {
        const caretOnly = !commit.changed.hasAny('document');

        if (!caretOnly || commit.tags.includes(CLEANUP)) return;

        editor.update({ history: 'skip', tags: CLEANUP }, removeStraySearch);
      },
    },
    read: ({ state }) => ({
      /** Every chip in document order, with its link. */
      items: (): SelectItem[] =>
        Array.from(state.nodes.entries({ at: [], type: plugin })).map(
          ([node]) => toItem(node)
        ),
    }),
    update: ({ tx }) => ({
      /** Removes the typed search. */
      clearSearch: () => {
        tx.nodes.remove({ at: [], match: isSearchText });
      },
      /** Inserts a chip at the caret, clears the search and moves the caret to the end. */
      pick: txLocate(false, (item: SelectItem) => {
        tx.nodes.insert([
          { children: [{ text: '' }], type, ...toItem(item) },
          { text: '' },
        ]);
        tx.nodes.remove({ at: [], match: isSearchText });

        const end = tx.points.end([]);

        if (end) tx.selection.set(end);
      }),
      /** Replaces every chip and the search with `items`. */
      replaceItems: txLocate(false, (items: readonly SelectItem[]) => {
        const hadSelection = tx.selection() !== null;

        tx.value.replace({ children: createValue(type, items) });

        const end = tx.points.end([]);

        if (hadSelection && end) tx.selection.set(end);
      }),
    }),
  })
);

const createValue = (type: string, items: readonly SelectItem[]) => [
  {
    children: [
      { text: '' },
      ...items.flatMap((item) => [
        { children: [{ text: '' }], type, ...toItem(item) },
        { text: '' },
      ]),
    ],
    type: 'paragraph',
  },
];

const projectItems = (
  children: readonly Descendant[],
  type: string
): SelectItem[] => {
  const items: SelectItem[] = [];
  const visit = (nodes: readonly Descendant[]) => {
    for (const node of nodes) {
      if (isTag(node, type)) items.push(toItem(node));
      else if (ElementApi.isElement(node)) visit(node.children);
    }
  };

  visit(children);

  return items;
};

const dedupeByTagKey = (items: readonly SelectItem[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = tagKey(item.value);

    if (seen.has(key)) return false;
    seen.add(key);

    return true;
  });
};

const sameItems = (a: readonly SelectItem[], b: readonly SelectItem[]) =>
  a.length === b.length &&
  a.every(
    (item, index) => item.value === b[index].value && item.url === b[index].url
  );

const getOptions = (
  catalog: readonly SelectItem[],
  chips: readonly SelectItem[],
  search: string
): Option[] => {
  const query = search.trim().replaceAll(/\s+/g, ' ');
  const selected = new Set(chips.map((chip) => tagKey(chip.value)));
  const known = new Set<string>();
  const options: Option[] = [];

  for (const item of catalog) {
    const key = tagKey(item.value);

    if (known.has(key)) continue;
    known.add(key);
    if (!selected.has(key)) options.push(item);
  }
  if (
    query.length >= CREATE_MIN_LENGTH &&
    !known.has(tagKey(query)) &&
    !selected.has(tagKey(query))
  ) {
    options.push({ create: true, value: query });
  }
  if (!query) return options;

  return new Fzf(options, {
    casing: 'case-insensitive',
    selector: (option) => option.value,
    sort: false,
  })
    .find(query)
    .map((result) => result.item);
};

type SelectEditorProps = Omit<
  React.ComponentProps<typeof Editor>,
  | 'aria-activedescendant'
  | 'aria-autocomplete'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-multiline'
  | 'defaultValue'
  | 'role'
  | 'value'
  | 'variant'
> & {
  /** The labels the menu offers. */
  items?: readonly SelectItem[];
  /**
   * Called with the chips after each change made in the field. A controlled
   * parent must update `value` synchronously: the field writes `value` back
   * whenever it differs from the chips, so a value set in a transition first
   * reverts the change.
   */
  onValueChange?: (items: SelectItem[]) => void;
} & (
    | { defaultValue?: never; value: readonly SelectItem[] }
    | { defaultValue?: readonly SelectItem[]; value?: never }
  );

/**
 * A one-line editor whose value is a list of chips, with a menu that filters
 * `items` by the typed search.
 */
export function SelectEditor({
  defaultValue,
  value,
  onValueChange,
  ...props
}: SelectEditorProps) {
  const editor = useCreateEditor(
    {
      plugins: [SelectTagPlugin.configure({ component: TagElement })],
      initialValue: createValue(
        TagPlugin.name,
        dedupeByTagKey(value ?? defaultValue ?? EMPTY_ITEMS)
      ),
    },
    []
  );

  return (
    <EditorRoot
      onValueChange={({ commit }) => {
        if (commit.tags.includes(RECEIVE)) return;

        const items = projectItems(commit.after.children, TagPlugin.name);

        if (
          !sameItems(
            projectItems(commit.before.children, TagPlugin.name),
            items
          )
        ) {
          onValueChange?.(items);
        }
      }}
      editor={editor}
    >
      <SelectEditorField value={value} {...props} />
    </EditorRoot>
  );
}

function SelectEditorField({
  className,
  items: catalog = EMPTY_ITEMS,
  readOnly,
  value,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: Omit<SelectEditorProps, 'defaultValue' | 'onValueChange' | 'value'> & {
  value?: readonly SelectItem[];
}) {
  const editor = useEditor();
  const containerRef = useEditorContainerRef();
  const listId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(FIRST_OPTION);
  const chips = useEditorSelector(
    (current) => current.plugin(SelectTagPlugin).read.items(),
    { equalityFn: (previous, next) => !!previous && sameItems(previous, next) }
  );
  const search = useEditorSelector((current) => current.read.text.string([]));
  const options = React.useMemo(
    () => getOptions(catalog, chips, search),
    [catalog, chips, search]
  );
  const menuOpen = open && !readOnly && options.length > 0;
  const activeFound =
    active.search === search
      ? options.findIndex((option) => tagKey(option.value) === active.key)
      : -1;
  const activeIndex = Math.max(0, activeFound);
  const activeIsDefault = activeFound < 0;
  const optionId = (index: number) => `${listId}-${index}`;

  React.useLayoutEffect(() => {
    if (value === undefined) return;

    const tags = editor.plugin(SelectTagPlugin);
    const items = dedupeByTagKey(value);

    if (sameItems(tags.read.items(), items)) return;

    tags.update({ history: 'skip', tags: RECEIVE }).replaceItems(items);
  }, [chips, editor, value]);

  const pick = (option: Option) => {
    editor
      .plugin(SelectTagPlugin)
      .update({ history: 'skip' })
      .pick(toItem(option));
  };

  const moveActive = (step: number) => {
    const index = (activeIndex + step + options.length) % options.length;

    setActive({ key: tagKey(options[index].value), search });
    requestAnimationFrame(() => {
      document
        .getElementById(optionId(index))
        ?.scrollIntoView({ block: 'nearest' });
    });
  };

  React.useEffect(() => {
    if (!menuOpen || !activeIsDefault) return;

    document
      .getElementById(`${listId}-0`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIsDefault, listId, menuOpen, options]);

  const anchor = React.useMemo(
    () => ({
      getBoundingClientRect: () =>
        containerRef.current?.getBoundingClientRect() ?? new DOMRect(),
    }),
    [containerRef]
  );

  return (
    <EditorContainer variant="select">
      <Editor
        className={className}
        variant="select"
        autoFocusOnEditable
        readOnly={readOnly}
        {...props}
        {...(readOnly
          ? {}
          : {
              'aria-activedescendant': menuOpen
                ? optionId(activeIndex)
                : undefined,
              'aria-autocomplete': 'list' as const,
              'aria-controls': menuOpen ? listId : undefined,
              'aria-expanded': menuOpen,
              'aria-haspopup': 'listbox' as const,
              role: 'combobox',
            })}
        aria-multiline={undefined}
        onBlur={(event) => {
          setOpen(false);
          editor
            .plugin(SelectTagPlugin)
            .update({ history: 'skip' })
            .clearSearch();
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setOpen(true);
          setActive(FIRST_OPTION);
          onFocus?.(event);
        }}
        onKeyDown={(event, context) => {
          if (
            isHotkey('mod+z', event) ||
            isHotkey('mod+shift+z', event) ||
            isHotkey('mod+y', event)
          ) {
            event.preventDefault();
            return true;
          }
          if (menuOpen && (isHotkey('down', event) || isHotkey('up', event))) {
            event.preventDefault();
            moveActive(isHotkey('down', event) ? 1 : -1);
            return true;
          }
          if (isHotkey('enter', event)) {
            event.preventDefault();
            if (menuOpen) pick(options[activeIndex]);
            return true;
          }
          if (isHotkey('escape', event) || isHotkey('mod+enter', event)) {
            event.preventDefault();
            editor.api.dom.blur();
            return HANDLED_NO_REFOCUS;
          }

          return onKeyDown?.(event, context);
        }}
      />
      {menuOpen && (
        <FloatingPopover open>
          <FloatingPopoverAnchor element={anchor} />
          <FloatingPopoverContent
            className="p-0 data-[state=open]:animate-none"
            style={{
              width: 'calc(var(--floating-popover-anchor-width) + 8px)',
            }}
            onFinalFocus={(event) => {
              event.preventDefault();
            }}
            onInitialFocus={(event) => {
              event.preventDefault();
            }}
            align="start"
            alignOffset={-4}
            sideOffset={8}
          >
            <div
              id={listId}
              className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto p-1 text-foreground"
              role="listbox"
            >
              {options.map((option, index) => (
                <button
                  id={optionId(index)}
                  key={option.create ? '' : tagKey(option.value)}
                  className="relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  aria-selected={index === activeIndex}
                  data-selected={index === activeIndex}
                  role="option"
                  tabIndex={-1}
                  type="button"
                  onClick={() => pick(option)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onPointerMove={() =>
                    setActive({ key: tagKey(option.value), search })
                  }
                >
                  {option.create ? (
                    <span className="flex items-center gap-1">
                      <PlusIcon className="text-foreground" />
                      Create new label:
                      <span className="text-gray-600">"{option.value}"</span>
                    </span>
                  ) : (
                    option.value
                  )}
                </button>
              ))}
            </div>
          </FloatingPopoverContent>
        </FloatingPopover>
      )}
    </EditorContainer>
  );
}
