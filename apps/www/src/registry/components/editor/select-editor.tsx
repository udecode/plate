'use client';

import { cn } from 'cn';
import { Fzf } from 'fzf';
import { PlusIcon, XIcon } from 'lucide-react';
import {
  BaseLinkPlugin,
  type Descendant,
  editorCommands,
  ElementApi,
  getLinkHref,
  isHotkey,
  linkUrlValidation,
  type Node,
  type Path,
  PathApi,
  type PluginTransaction,
  property,
  type Text,
  TextApi,
  txLocate,
} from 'platejs';
import {
  definePlugin,
  EditorElement,
  type EditorElementProps,
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorContainerRef,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  useElementSelected,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';

import { Editor, EditorContainer } from './editor';

export type SelectItem = { url?: string; value: string };

type Option = SelectItem & { create?: true };

const tagKey = (value: string) => value.toLowerCase();

const CREATE_MIN_LENGTH = 2;
const DEFAULT_LIMIT = 100;

const RECEIVE = 'select-editor-receive';
const CLEANUP = 'select-editor-cleanup';

const EMPTY_ITEMS: readonly SelectItem[] = [];

const FIRST_OPTION = { key: '', search: '' };

const HANDLED_NO_REFOCUS = { kind: 'none' } as const;

export const TagPlugin = definePlugin('tag', {
  schema: {
    element: {
      properties: {
        url: property.string(linkUrlValidation),
        value: property.string({ required: true }),
      },
      void: 'inline',
    },
  },
});

function TagLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string | undefined;
}) {
  if (href === undefined) return children;

  return <a href={href}>{children}</a>;
}

function ConfiguredTagLink({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  const allowedSchemes = usePluginStore(BaseLinkPlugin, 'allowedSchemes');

  return (
    <TagLink href={getLinkHref(url, { allowedSchemes })}>{children}</TagLink>
  );
}

const isTag = (
  node: Node,
  type: string
): node is Node & { url?: string; value: string } =>
  ElementApi.isElementType(node, type) && typeof node.value === 'string';

const toItem = (node: { url?: string; value: string }): SelectItem => ({
  ...(node.url !== undefined && linkUrlValidation.validate(node.url)
    ? { url: node.url }
    : {}),
  value: node.value,
});

const dedupeByTagKey = (items: readonly SelectItem[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = tagKey(item.value);

    if (seen.has(key)) return false;
    seen.add(key);

    return true;
  });
};

const normalizeItems = (items: readonly SelectItem[]): SelectItem[] =>
  dedupeByTagKey(items).map(toItem);

const sameItems = (a: readonly SelectItem[], b: readonly SelectItem[]) =>
  a.length === b.length &&
  a.every(
    (item, index) => item.value === b[index].value && item.url === b[index].url
  );

const isSearchText = (node: Node): node is Text =>
  TextApi.isText(node) && node.text.length > 0;

const deleteTextEntries = (
  tx: PluginTransaction,
  entries: ReadonlyArray<readonly [Text, Path]>
) => {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const [node, path] = entries[index];

    tx.text.delete({
      at: {
        anchor: { offset: 0, path },
        focus: { offset: node.text.length, path },
      },
    });
  }
};

const clearSearchText = (tx: PluginTransaction) => {
  const entries = Array.from(tx.nodes.entries({ at: [], match: isSearchText }));

  if (entries.length > 0) deleteTextEntries(tx, entries);
};

const removeStraySearch = (tx: PluginTransaction) => {
  const selection = tx.selection();
  const selected = selection
    ? Array.from(
        tx.nodes.entries({ at: selection, match: TextApi.isText })
      ).map(([, path]) => path)
    : [];
  const entries = Array.from(
    tx.nodes.entries({
      at: [],
      match: (node, path): node is Text =>
        isSearchText(node) &&
        !selected.some((selectedPath) => PathApi.equals(selectedPath, path)),
    })
  );

  if (entries.length > 0) deleteTextEntries(tx, entries);
};

export const SelectTagPlugin = TagPlugin.extend(
  ({ editor, plugin, schema: { type } }) => ({
    commands: ({ around }) => {
      const readTagItems = (nodes: {
        entries: (options: {
          at: [];
          type: typeof plugin;
        }) => Iterable<readonly [{ url?: string; value: string }, Path]>;
      }): SelectItem[] =>
        Array.from(nodes.entries({ at: [], type: plugin })).map(([node]) =>
          toItem(node)
        );

      return [
        around(editorCommands.insertText, ({ next, state }) => {
          const before = readTagItems(state.nodes);
          const result = next();

          return result === false
            ? false
            : state.transaction.extend(result, (tx) => {
                if (sameItems(before, readTagItems(tx.nodes))) {
                  tx.tags.add('history-skip');
                }
              });
        }),
        around(editorCommands.delete, ({ next, state }) => {
          const before = readTagItems(state.nodes);
          const result = next();

          return result === false
            ? false
            : state.transaction.extend(result, (tx) => {
                if (sameItems(before, readTagItems(tx.nodes))) {
                  tx.tags.add('history-skip');
                }
              });
        }),
        around(editorCommands.deleteFragment, ({ next, state }) => {
          const before = readTagItems(state.nodes);
          const result = next();

          return result === false
            ? false
            : state.transaction.extend(result, (tx) => {
                if (sameItems(before, readTagItems(tx.nodes))) {
                  tx.tags.add('history-skip');
                }
              });
        }),
        around(editorCommands.replaceSlice, ({ next, state }) => {
          const before = readTagItems(state.nodes);
          const result = next();

          return result === false
            ? false
            : state.transaction.extend(result, (tx) => {
                if (sameItems(before, readTagItems(tx.nodes))) {
                  tx.tags.add('history-skip');
                }
              });
        }),
        around(editorCommands.transposeCharacter, ({ next, state }) => {
          const before = readTagItems(state.nodes);
          const result = next();

          return result === false
            ? false
            : state.transaction.extend(result, (tx) => {
                if (sameItems(before, readTagItems(tx.nodes))) {
                  tx.tags.add('history-skip');
                }
              });
        }),
      ];
    },
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
        clearSearchText(tx);
      },
      /** Clears any search text and inserts a chip at the caret. */
      pick: txLocate(false, (item: SelectItem) => {
        clearSearchText(tx);
        tx.nodes.insert([
          { children: [{ text: '' }], type, ...toItem(item) },
          { text: '' },
        ]);
      }),
      /** Removes the chip identified by `id`. */
      remove: txLocate(false, (id: string) => {
        tx.nodes.remove({ at: { id } });
      }),
      /** Reconciles the document chips in place to match `items`. */
      replaceItems: txLocate(false, (items: readonly SelectItem[]) => {
        clearSearchText(tx);

        const nextItems = normalizeItems(items);
        const nextIndexByKey = new Map(
          nextItems.map((item, index) => [tagKey(item.value), index])
        );
        const current = Array.from(tx.nodes.entries({ at: [], type: plugin }));
        const keptIndices = new Set<number>();
        let lastNextIndex = -1;

        for (let index = 0; index < current.length; index += 1) {
          const nextIndex = nextIndexByKey.get(tagKey(current[index][0].value));

          if (nextIndex !== undefined && nextIndex > lastNextIndex) {
            keptIndices.add(index);
            lastNextIndex = nextIndex;
          }
        }

        for (let index = current.length - 1; index >= 0; index -= 1) {
          if (!keptIndices.has(index)) {
            tx.nodes.remove({ at: current[index][1] });
          }
        }

        let remaining = Array.from(tx.nodes.entries({ at: [], type: plugin }));
        let keptCursor = 0;

        for (const target of nextItems) {
          const currentEntry = remaining[keptCursor];

          if (
            currentEntry &&
            tagKey(currentEntry[0].value) === tagKey(target.value)
          ) {
            const [node, path] = currentEntry;

            if (node.value !== target.value) {
              tx.nodes.set({ value: target.value }, { at: path });
            }
            if (target.url === undefined) {
              if (node.url !== undefined) tx.nodes.unset('url', { at: path });
            } else if (node.url !== target.url) {
              tx.nodes.set({ url: target.url }, { at: path });
            }

            keptCursor += 1;
            continue;
          }

          const root = tx.nodes.get([0]);
          const childCount = ElementApi.isElement(root)
            ? root.children.length
            : 0;
          const insertAt = currentEntry ? currentEntry[1] : [0, childCount];

          tx.nodes.insert(
            [{ children: [{ text: '' }], type, ...target }, { text: '' }],
            { at: insertAt }
          );
          remaining = Array.from(tx.nodes.entries({ at: [], type: plugin }));
          keptCursor += 1;
        }
      }),
    }),
  })
);

export function TagElement(props: EditorElementProps<typeof TagPlugin>) {
  const { editor, element } = props;
  const selected = useElementSelected({ mode: 'text' });
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();

  const badge = (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 break-normal rounded-full border px-2.5 py-0.5 align-middle font-semibold text-sm transition-colors focus:outline-none',
        'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/60',
        !readOnly && 'pr-1.5',
        selected && focused && 'ring-2 ring-ring ring-offset-0'
      )}
    >
      <span>{element.value}</span>
      {!readOnly && element.id ? (
        <button
          aria-label={`Remove ${element.value}`}
          className="relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors after:absolute after:-inset-1 hover:bg-foreground/10 hover:text-foreground focus:outline-none"
          tabIndex={-1}
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            const { id } = element;

            if (!id) return;

            const selectTags = editor.plugin(SelectTagPlugin);

            if (selectTags.installed) {
              selectTags.update({ history: 'new-batch' }).remove(id);
            } else {
              editor.update({ history: 'new-batch' }, (tx) => {
                tx.nodes.remove({ at: { id } });
              });
            }

            editor.api.dom.focus();
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </span>
  );

  return (
    <EditorElement
      {...props}
      className="m-0.5 inline-flex cursor-pointer select-none"
      attributes={{
        ...props.attributes,
        draggable: true,
      }}
    >
      <span contentEditable={false}>
        {readOnly && element.url ? (
          editor.plugin(BaseLinkPlugin).installed ? (
            <ConfiguredTagLink url={element.url}>{badge}</ConfiguredTagLink>
          ) : (
            <TagLink href={getLinkHref(element.url)}>{badge}</TagLink>
          )
        ) : (
          badge
        )}
      </span>
      {props.children}
    </EditorElement>
  );
}

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

const normalizeLimit = (limit: number) => {
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(limit)) return DEFAULT_LIMIT;

  return Math.max(1, Math.floor(limit));
};

const getOptionState = (
  catalog: readonly SelectItem[],
  chips: readonly SelectItem[],
  search: string,
  { creatable, limit }: { creatable: boolean; limit: number }
): {
  hiddenCount: number;
  options: Option[];
  totalMatches: number;
  visibleCatalogCount: number;
} => {
  const maxItems = normalizeLimit(limit);
  const query = search.trim().replaceAll(/\s+/g, ' ');
  const selected = new Set(chips.map((chip) => tagKey(chip.value)));
  const known = new Set<string>();
  const available: SelectItem[] = [];

  for (const item of catalog) {
    const key = tagKey(item.value);

    if (known.has(key)) continue;
    known.add(key);
    if (!selected.has(key)) available.push(item);
  }

  const createOption: Option | null =
    creatable &&
    query.length >= CREATE_MIN_LENGTH &&
    !known.has(tagKey(query)) &&
    !selected.has(tagKey(query))
      ? { create: true, value: query }
      : null;

  if (!query) {
    const totalMatches = available.length;
    const visibleCatalog = available.slice(0, maxItems);

    return {
      hiddenCount: Math.max(0, totalMatches - visibleCatalog.length),
      options: visibleCatalog,
      totalMatches,
      visibleCatalogCount: visibleCatalog.length,
    };
  }

  const matches = new Fzf(available, {
    casing: 'case-insensitive',
    selector: (option) => option.value,
    sort: false,
  }).find(query);
  const totalMatches = matches.length;
  const visibleCatalog =
    totalMatches > maxItems
      ? [...matches]
          .sort(
            (a, b) =>
              b.score - a.score ||
              a.item.value.length - b.item.value.length ||
              a.start - b.start
          )
          .slice(0, maxItems)
          .map((result) => result.item)
      : matches.map((result) => result.item);

  return {
    hiddenCount: Math.max(0, totalMatches - visibleCatalog.length),
    options: createOption ? [...visibleCatalog, createOption] : visibleCatalog,
    totalMatches,
    visibleCatalogCount: visibleCatalog.length,
  };
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
  /** Allow creating new labels from typed search in the menu. Defaults to false. */
  creatable?: boolean;
  /** The labels the menu offers. */
  items?: readonly SelectItem[];
  /** Maximum catalog options rendered in the menu. Defaults to 100. */
  limit?: number;
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
        normalizeItems(value ?? defaultValue ?? EMPTY_ITEMS)
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
  creatable = false,
  items: catalog = EMPTY_ITEMS,
  limit = DEFAULT_LIMIT,
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
    { equalityFn: sameItems }
  );
  const search = useEditorSelector((current) => current.read.text.string([]));
  const { hiddenCount, options, totalMatches, visibleCatalogCount } =
    React.useMemo(
      () => getOptionState(catalog, chips, search, { creatable, limit }),
      [catalog, chips, creatable, limit, search]
    );
  const hasSearch = search.trim().length > 0;
  const menuOpen = open && !readOnly && (options.length > 0 || hasSearch);
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
    const items = normalizeItems(value);

    if (sameItems(tags.read.items(), items)) return;

    tags.update({ history: 'skip', tags: RECEIVE }).replaceItems(items);
  }, [chips, editor, value]);

  const pick = (option: Option) => {
    const tags = editor.plugin(SelectTagPlugin);

    tags.update({ history: 'skip' }).clearSearch();
    tags.update({ history: 'new-batch' }).pick(toItem(option));
  };

  const moveActive = (step: number) => {
    if (options.length === 0) return;

    const index = (activeIndex + step + options.length) % options.length;

    setActive({ key: tagKey(options[index].value), search });
    document
      .getElementById(optionId(index))
      ?.scrollIntoView({ block: 'nearest' });
  };

  React.useEffect(() => {
    if (!menuOpen || options.length === 0 || !activeIsDefault) return;

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
              'aria-activedescendant':
                menuOpen && options.length > 0
                  ? optionId(activeIndex)
                  : undefined,
              'aria-autocomplete': 'list' as const,
              'aria-controls': menuOpen ? listId : undefined,
              'aria-expanded': menuOpen,
              'aria-haspopup': 'listbox' as const,
              role: 'combobox',
            })}
        aria-multiline={undefined}
        onBlur={(event, context) => {
          setOpen(false);
          editor
            .plugin(SelectTagPlugin)
            .update({ history: 'skip' })
            .clearSearch();
          onBlur?.(event, context);
        }}
        onFocus={(event, context) => {
          setOpen(true);
          setActive(FIRST_OPTION);
          onFocus?.(event, context);
        }}
        onKeyDown={(event, context) => {
          if (
            menuOpen &&
            options.length > 0 &&
            (isHotkey('down', event) || isHotkey('up', event))
          ) {
            event.preventDefault();
            moveActive(isHotkey('down', event) ? 1 : -1);
            return true;
          }
          if (isHotkey('enter', event)) {
            event.preventDefault();
            if (menuOpen && options.length > 0) pick(options[activeIndex]);
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
            {options.length > 0 ? (
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
                    onPointerMove={() => {
                      const key = tagKey(option.value);

                      setActive((prev) =>
                        prev.key === key && prev.search === search
                          ? prev
                          : { key, search }
                      );
                    }}
                  >
                    {option.create ? (
                      <span className="flex items-center gap-1">
                        <PlusIcon className="text-foreground" />
                        Create new label:
                        <span className="text-muted-foreground">
                          "{option.value}"
                        </span>
                      </span>
                    ) : (
                      option.value
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div
                id={listId}
                className="px-3 py-2 text-sm text-muted-foreground"
                role="status"
              >
                No results found.
              </div>
            )}
            {hiddenCount > 0 ? (
              <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                Showing {visibleCatalogCount} of {totalMatches} matches. Type to
                filter.
              </div>
            ) : null}
          </FloatingPopoverContent>
        </FloatingPopover>
      )}
    </EditorContainer>
  );
}
