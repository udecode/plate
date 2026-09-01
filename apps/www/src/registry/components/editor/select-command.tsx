'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { Primitive } from '@radix-ui/react-primitive';
import type { JSX } from 'react';
import * as React from 'react';

import { commandScore } from './select-command-score';

// FORK
type Actions = {
  // Select current item. Can be used outside of the menu (e.g. Enter from another input).
  selectCurrentItem: () => void;
  // Select first item in the list
  selectFirstItem: () => void;
  // Select item at index
  selectItem: (index: number) => void;
  // Select last item in the list
  selectLastItem: () => void;
  // Select next group
  selectNextGroup: (e: React.KeyboardEvent) => void;
  // Select next item. Can be used outside of the menu (e.g. ArrowDown from another input).
  selectNextItem: (e: React.KeyboardEvent) => void;
  // Select previous group
  selectPrevGroup: (e: React.KeyboardEvent) => void;
  // Select previous item. Can be used outside of the menu (e.g. ArrowUp from another input).
  selectPrevItem: (e: React.KeyboardEvent) => void;
  // Set search so Input is not required and we can use another one.
  setSearch: (search: string) => void;
};

type Context = {
  inputId: string;
  label: string;
  labelId: string;
  // Ids
  listId: string;
  // Refs
  listInnerRef: React.RefObject<HTMLDivElement | null>;
  filter: () => boolean;
  getDisablePointerSelection: () => boolean;
  getValue: (id: string) => string | undefined;
  group: (id: string) => () => void;
  item: (id: string, groupId?: string) => () => void;
  value: (id: string, value: string, keywords?: string[]) => void;
};
type Group = {
  id: string;
  forceMount?: boolean;
};

type State = {
  filtered: { count: number; groups: Set<string>; items: Map<string, number> };
  search: string;
  value: string | undefined;
};
type Store = {
  emit: () => void;
  setState: <K extends keyof State>(
    key: K,
    value: State[K],
    preventScroll?: boolean
  ) => void;
  snapshot: () => State;
  subscribe: (callback: () => void) => () => void;
};

const GROUP_SELECTOR = `[cmdk-group=""]`;
const GROUP_ITEMS_SELECTOR = `[cmdk-group-items=""]`;
const GROUP_HEADING_SELECTOR = `[cmdk-group-heading=""]`;
const ITEM_SELECTOR = `[cmdk-item=""]`;
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const SELECT_EVENT = 'cmdk-item-select';
const VALUE_ATTR = 'data-value';
const defaultFilter: NonNullable<
  ({ children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {
      /** Optional default item value when it is initially rendered. */
      defaultValue?: string;
      /** Optionally set to `true` to disable selection via pointer events. */
      disablePointerSelection?: boolean;
      /** Accessible label for this command menu. Not shown visibly. */
      label?: string;
      /**
       * Optionally set to `true` to turn on looping around when using the arrow
       * keys.
       */
      loop?: boolean;
      /**
       * Optionally set to `false` to turn off the automatic filtering and
       * sorting. If `false`, you must conditionally render valid items based on
       * the search query yourself.
       */
      shouldFilter?: boolean;
      /** Optional controlled state of the selected command menu item. */
      value?: string;
      /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
      vimBindings?: boolean;
      /**
       * Custom filter function for whether each command menu item should matches
       * the given search query. It should return a number between 0 and 1, with 1
       * being the best match and 0 being hidden entirely. By default, uses the
       * `command-score` library.
       */
      filter?: (value: string, search: string, keywords?: string[]) => number;
      /** Event handler called when the selected item of the menu changes. */
      onValueChange?: (value: string) => void;
    })['filter']
> = (value, search, keywords) => commandScore(value, search, keywords);

const CommandContext = React.createContext<Context | undefined>(undefined);
const useCommand = () => {
  const context = React.useContext(CommandContext);

  if (!context) {
    throw new Error('Command components must be used within Command');
  }

  return context;
};
const StoreContext = React.createContext<Store | undefined>(undefined);
// FORK
const ActionsContext = React.createContext<Actions | undefined>(undefined);
const useStore = () => {
  const store = React.useContext(StoreContext);

  if (!store) {
    throw new Error('Command components must be used within Command');
  }

  return store;
};

// FORK
export const useCommandActions = () => {
  const context = React.useContext(ActionsContext);

  if (context === undefined) {
    throw new Error(
      'useCommandActions must be used within a Command component'
    );
  }

  return context;
};

const GroupContext = React.createContext<Group | undefined>(undefined);

// const getId = (() => {
//   let i = 0;
//   return () => `${i++}`;
// })();
// const useIdCompatibility = () => {
//   React.useState(getId);
//   const [id] = React.useState(getId);
//   return 'cmdk' + id;
// };

const Command = (
  props: { children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {
      /** Optional default item value when it is initially rendered. */
      defaultValue?: string;
      /** Optionally set to `true` to disable selection via pointer events. */
      disablePointerSelection?: boolean;
      /** Accessible label for this command menu. Not shown visibly. */
      label?: string;
      /**
       * Optionally set to `true` to turn on looping around when using the arrow
       * keys.
       */
      loop?: boolean;
      /**
       * Optionally set to `false` to turn off the automatic filtering and
       * sorting. If `false`, you must conditionally render valid items based on
       * the search query yourself.
       */
      shouldFilter?: boolean;
      /** Optional controlled state of the selected command menu item. */
      value?: string;
      /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
      vimBindings?: boolean;
      /**
       * Custom filter function for whether each command menu item should matches
       * the given search query. It should return a number between 0 and 1, with 1
       * being the best match and 0 being hidden entirely. By default, uses the
       * `command-score` library.
       */
      filter?: (value: string, search: string, keywords?: string[]) => number;
      /** Event handler called when the selected item of the menu changes. */
      onValueChange?: (value: string) => void;
    }
) => {
  const state = useLazyRef<State>(() => ({
    filtered: {
      /** The count of all visible items. */
      count: 0,
      /** Set of groups with at least one visible item. */
      groups: new Set(),
      /** Map from visible item id to its search score. */
      items: new Map(),
    },
    /** Value of the search query. */
    search: '',
    /** Currently selected item value. */
    value: props.value ?? props.defaultValue ?? '',
  }));
  // [...itemIds]
  const allItems = useLazyRef<Set<string>>(() => new Set());
  // groupId → [...itemIds]
  const allGroups = useLazyRef<Map<string, Set<string>>>(() => new Map());
  const ids = useLazyRef<Map<string, { value: string; keywords?: string[] }>>(
    () => new Map()
    // id → { value, keywords }
  );
  // [...rerenders]
  const listeners = useLazyRef<Set<() => void>>(() => new Set());
  const propsRef = useAsRef(props);
  const {
    children,
    filter,
    label,
    loop,
    ref: forwardedRef,
    shouldFilter,
    value,
    vimBindings = true,
    onValueChange,
    ...etc
  } = props;

  const listId = React.useId();
  const labelId = React.useId();
  const inputId = React.useId();

  const listInnerRef = React.useRef<HTMLDivElement>(null);

  const schedule = useScheduleLayoutEffect();

  const store = useLazyRef<Store>(() => ({
    emit: () => {
      for (const l of listeners.current) {
        l();
      }
    },
    setState: (key, innerValue, preventScroll) => {
      if (Object.is(state.current[key], innerValue)) return;

      state.current[key] = innerValue;

      if (key === 'search') {
        // Filter synchronously before emitting back to children
        filterItems();
        sort();
        schedule(1, selectFirstItem);
      } else if (key === 'value') {
        if (!preventScroll) {
          // Scroll the selected item into view
          schedule(5, scrollSelectedIntoView);
        }
        if (propsRef.current?.value !== undefined) {
          // If controlled, just call the callback instead of updating state internally
          const newValue = state.current.value ?? '';
          propsRef.current.onValueChange?.(newValue);

          return;
        }
      }

      // Notify subscribers that state has changed
      store.emit();
    },
    snapshot: () => state.current,
    subscribe: (cb) => {
      listeners.current.add(cb);

      return () => listeners.current.delete(cb);
    },
  })).current;

  const context = useLazyRef<Context>(() => ({
    inputId,
    label: label ?? props['aria-label'] ?? 'Command Menu',
    labelId,
    listId,
    listInnerRef,
    filter: () => propsRef.current.shouldFilter !== false,
    getDisablePointerSelection: () =>
      propsRef.current.disablePointerSelection ?? false,
    getValue: (id) => ids.current.get(id)?.value,
    // Track group lifecycle (mount, unmount)
    group: (id) => {
      if (!allGroups.current.has(id)) {
        allGroups.current.set(id, new Set());
      }

      return () => {
        ids.current.delete(id);
        allGroups.current.delete(id);
      };
    },
    // Track item lifecycle (mount, unmount)
    item: (id, groupId) => {
      allItems.current.add(id);

      // Track this item within the group
      if (groupId) {
        if (allGroups.current.has(groupId)) {
          allGroups.current.get(groupId)?.add(id);
        } else {
          allGroups.current.set(groupId, new Set([id]));
        }
      }

      // Batch this, multiple items can mount in one pass
      // and we should not be filtering/sorting/emitting each time
      schedule(3, () => {
        filterItems();
        sort();

        // Could be initial mount, select the first item if none already selected
        if (!state.current.value) {
          selectFirstItem();
        }

        store.emit();
      });

      return () => {
        ids.current.delete(id);
        allItems.current.delete(id);
        state.current.filtered.items.delete(id);
        const selectedItem = getSelectedItem();

        // Batch this, multiple items could be removed in one pass
        schedule(4, () => {
          filterItems();

          // The item removed have been the selected one,
          // so selection should be moved to the first
          if (selectedItem?.getAttribute('id') === id) selectFirstItem();

          store.emit();
        });
      };
    },
    // Keep id → {value, keywords} mapping up-to-date
    value: (id, innerValue2, keywords) => {
      if (innerValue2 !== ids.current.get(id)?.value) {
        ids.current.set(id, { keywords, value: innerValue2 });
        state.current.filtered.items.set(id, score(innerValue2, keywords));
        schedule(2, () => {
          sort();
          store.emit();
        });
      }
    },
  })).current;

  /** Controlled mode `value` handling. */
  useLayoutEffect(() => {
    if (value !== undefined) {
      const v = value.trim();
      state.current.value = v;
      store.emit();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] The lazy ref is a stable mutable store cell; its current value is the effect target, not a reactive dependency.
  }, [store, value]);

  useLayoutEffect(() => {
    schedule(6, scrollSelectedIntoView);
  }, [schedule]);

  function score(innerValue3: string, keywords?: string[]) {
    const innerFilter = propsRef.current?.filter ?? defaultFilter;

    return innerValue3
      ? innerFilter(innerValue3, state.current.search, keywords)
      : 0;
  }

  /** Sorts items by score, and groups by highest item score. */
  function sort() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      return;
    }

    const scores = state.current.filtered.items;

    // Sort the groups
    const groups: Array<[string, number]> = [];
    state.current.filtered.groups.forEach((innerValue4) => {
      const items = allGroups.current.get(innerValue4);

      // Get the maximum score of the group's items
      let max = 0;
      items?.forEach((item) => {
        const innerScore = scores.get(item) ?? 0;
        max = Math.max(innerScore, max);
      });

      groups.push([innerValue4, max]);
    });

    // Sort items within groups to bottom
    // Sort items outside of groups
    // Sort groups to bottom (pushes all non-grouped items to the top)
    const listInsertionElement = listInnerRef.current;

    if (!listInsertionElement) return;

    // Sort the items
    getValidItems()
      .sort((a, b) => {
        const valueA = a.getAttribute('id');
        const valueB = b.getAttribute('id');

        return (
          (scores.get(valueB ?? '') ?? 0) - (scores.get(valueA ?? '') ?? 0)
        );
      })
      .forEach((item) => {
        const group = item.closest(GROUP_ITEMS_SELECTOR);
        const insertionTarget =
          item.parentElement === (group ?? listInsertionElement)
            ? item
            : item.closest(`${GROUP_ITEMS_SELECTOR} > *`);

        if (!insertionTarget) return;

        if (group) {
          group.append(insertionTarget);
        } else {
          listInsertionElement.append(insertionTarget);
        }
      });

    groups
      .sort((a, b) => b[1] - a[1])
      .forEach((group) => {
        const element = listInnerRef.current?.querySelector(
          `${GROUP_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(group[0])}"]`
        );
        element?.parentElement?.append(element);
      });
  }

  function selectFirstItem() {
    const item = getValidItems().find(
      (innerItem) => innerItem.getAttribute('aria-disabled') !== 'true'
    );
    const innerValue5 = item?.getAttribute(VALUE_ATTR);
    store.setState('value', innerValue5 ?? undefined);
  }

  /** Filters the current items. */
  function filterItems() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      state.current.filtered.count = allItems.current.size;

      // Do nothing, each item will know to show itself because search is empty
      return;
    }

    // Reset the groups
    state.current.filtered.groups = new Set();
    let itemCount = 0;

    // Check which items should be included
    for (const id of allItems.current) {
      const innerValue6 = ids.current.get(id)?.value ?? '';
      const keywords = ids.current.get(id)?.keywords ?? [];
      const rank = score(innerValue6, keywords);
      state.current.filtered.items.set(id, rank);

      if (rank > 0) itemCount += 1;
    }

    // Check which groups have at least 1 item shown
    for (const [groupId, group] of allGroups.current) {
      for (const itemId of group) {
        if ((state.current.filtered.items.get(itemId) ?? 0) > 0) {
          state.current.filtered.groups.add(groupId);

          break;
        }
      }
    }

    state.current.filtered.count = itemCount;
  }

  function scrollSelectedIntoView() {
    const item = getSelectedItem();

    if (item) {
      if (item.parentElement?.firstChild === item) {
        // First item in Group, ensure heading is in view
        item
          .closest(GROUP_SELECTOR)
          ?.querySelector(GROUP_HEADING_SELECTOR)
          ?.scrollIntoView({ block: 'nearest' });
      }

      // Ensure the item is always in view
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  /** Getters */

  function getSelectedItem() {
    return listInnerRef.current?.querySelector<HTMLElement>(
      `${ITEM_SELECTOR}[aria-selected="true"]`
    );
  }

  function getValidItems() {
    return Array.from(
      listInnerRef.current?.querySelectorAll<HTMLElement>(
        VALID_ITEM_SELECTOR
      ) ?? []
    );
  }

  /** Setters */

  function updateSelectedToIndex(index: number) {
    const items = getValidItems();
    const item = items[index];

    const innerValue7 = item?.getAttribute(VALUE_ATTR);

    if (innerValue7 !== null && innerValue7 !== undefined) {
      store.setState('value', innerValue7);
    }
  }

  function updateSelectedByItem(change: -1 | 1) {
    const selected = getSelectedItem();

    if (!selected) return;
    const items = getValidItems();
    const index = items.indexOf(selected);

    // Get item at this index
    let newSelected: HTMLElement | undefined = items[index + change];

    if (propsRef.current?.loop) {
      newSelected =
        index + change < 0
          ? items.at(-1)
          : index + change === items.length
            ? items[0]
            : items[index + change];
    }
    const innerValue8 = newSelected?.getAttribute(VALUE_ATTR);

    if (innerValue8 !== null && innerValue8 !== undefined) {
      store.setState('value', innerValue8);
    }
  }

  function updateSelectedByGroup(change: -1 | 1) {
    const selected = getSelectedItem();
    let group = selected?.closest(GROUP_SELECTOR);
    let item: Element | undefined;

    while (group && !item) {
      group =
        change > 0
          ? findNextSibling(group, GROUP_SELECTOR)
          : findPreviousSibling(group, GROUP_SELECTOR);
      item = group?.querySelector(VALID_ITEM_SELECTOR) ?? undefined;
    }

    if (item) {
      const innerValue9 = item.getAttribute(VALUE_ATTR);

      if (innerValue9 !== null) store.setState('value', innerValue9);
    } else {
      updateSelectedByItem(change);
    }
  }

  const last = () => {
    updateSelectedToIndex(getValidItems().length - 1);
  };

  const next = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.metaKey) {
      // Last item
      last();
    } else if (e.altKey) {
      // Next group
      updateSelectedByGroup(1);
    } else {
      // Next item
      updateSelectedByItem(1);
    }
  };

  const prev = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.metaKey) {
      // First item
      updateSelectedToIndex(0);
    } else if (e.altKey) {
      // Previous group
      updateSelectedByGroup(-1);
    } else {
      // Previous item
      updateSelectedByItem(-1);
    }
  };

  // FORK: refactor
  const selectItem = () => {
    const item = getSelectedItem();

    if (item) {
      const event = new Event(SELECT_EVENT);
      item.dispatchEvent(event);
    }
  };

  const setSearch = (search: string) => {
    store.setState('search', search);
  };

  const actions = useLazyRef<Actions>(() => ({
    selectCurrentItem: selectItem,
    selectFirstItem,
    selectItem: updateSelectedToIndex,
    selectLastItem: last,
    selectNextItem: next,
    selectPrevItem: prev,
    setSearch,
    selectNextGroup: () => {
      updateSelectedByGroup(1);
    },
    selectPrevGroup: () => {
      updateSelectedByGroup(-1);
    },
  })).current;
  // FORK END

  return (
    <Primitive.div
      ref={forwardedRef}
      tabIndex={-1}
      {...etc}
      cmdk-root=""
      onKeyDown={(e) => {
        etc.onKeyDown?.(e);

        if (!e.defaultPrevented) {
          switch (e.key) {
            case 'ArrowDown': {
              next(e);

              break;
            }
            case 'ArrowUp': {
              prev(e);

              break;
            }
            case 'End': {
              // Last item
              e.preventDefault();
              last();

              break;
            }
            case 'Enter': {
              // Check if IME composition is finished before triggering onSelect
              // This prevents unwanted triggering while user is still inputting text with IME
              // e.keyCode === 229 is for the Japanese IME and Safari.
              // isComposing does not work with Japanese IME and Safari combination.
              // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] Safari's Japanese IME still needs the 229 fallback because isComposing is unreliable there.
              if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
                // Trigger item onSelect
                e.preventDefault();
                const item = getSelectedItem();

                if (item) {
                  const event = new Event(SELECT_EVENT);
                  item.dispatchEvent(event);
                }
              }
              break;
            }
            case 'Home': {
              // First item
              e.preventDefault();
              updateSelectedToIndex(0);

              break;
            }

            case 'j':
            case 'n': {
              // vim keybind down
              if (vimBindings && e.ctrlKey) {
                next(e);
              }
              break;
            }
            case 'k':
            case 'p': {
              // vim keybind up
              if (vimBindings && e.ctrlKey) {
                prev(e);
              }
              break;
            }
          }
        }
      }}
    >
      <label
        cmdk-label=""
        // Screen reader only
        htmlFor={context.inputId}
        id={context.labelId}
        style={srOnlyStyles}
      >
        {label}
      </label>

      {slottableWithNestedChildren(props, (child) => (
        <StoreContext value={store}>
          {/* FORK: provide actions */}
          <ActionsContext value={actions}>
            <CommandContext value={context}>{child}</CommandContext>
          </ActionsContext>
        </StoreContext>
      ))}
    </Primitive.div>
  );
};

/**
 * Command menu item. Becomes active on pointer enter or through keyboard
 * navigation. Preferably pass a `value`, otherwise the value will be inferred
 * from `children` or the rendered item's `textContent`.
 */
const Item = (
  props: { children?: React.ReactNode } & Omit<
    React.ComponentPropsWithRef<typeof Primitive.div>,
    'disabled' | 'onSelect' | 'value'
  > & {
      /** Whether this item is currently disabled. */
      disabled?: boolean;
      /** Whether this item is forcibly rendered regardless of filtering. */
      forceMount?: boolean;
      /** Optional keywords to match against when filtering. */
      keywords?: string[];
      /**
       * A unique value for this item. If no value is provided, it will be
       * inferred from `children` or the rendered `textContent`. If your
       * `textContent` changes between renders, you _must_ provide a stable,
       * unique `value`.
       */
      value?: string;
      /**
       * Event handler for when this item is selected, either via click or
       * keyboard selection.
       */
      onSelect?: (value: string) => void;
    }
) => {
  const id = React.useId();
  const ref = React.useRef<HTMLDivElement>(null);
  const groupContext = React.useContext(GroupContext);
  const context = useCommand();
  const propsRef = useAsRef(props);
  const forceMount = props.forceMount ?? groupContext?.forceMount;

  useLayoutEffect(() => {
    if (!forceMount) {
      return context.item(id, groupContext?.id);
    }

    return undefined;
  }, [context, forceMount, groupContext?.id, id]);

  useValue(id, ref, [props.value, props.children, ref]);

  const store = useStore();
  const selected = useCmdk(
    (state) => state.value && state.value === context.getValue(id)
  );
  const render = useCmdk((state) =>
    forceMount
      ? true
      : !context.filter()
        ? true
        : state.search
          ? (state.filtered.items.get(id) ?? 0) > 0
          : true
  );
  const select = React.useCallback(() => {
    const currentValue = context.getValue(id);

    if (currentValue !== undefined) {
      store.setState('value', currentValue, true);
    }
  }, [context, id, store]);
  const onSelect = React.useCallback(() => {
    const currentValue = context.getValue(id);

    if (currentValue === undefined) return;

    select();
    propsRef.current.onSelect?.(currentValue);
  }, [context, id, propsRef, select]);

  React.useEffect(() => {
    const element = ref.current;

    if (!element || props.disabled) return undefined;

    element.addEventListener(SELECT_EVENT, onSelect);

    return () => {
      element.removeEventListener(SELECT_EVENT, onSelect);
    };
  }, [onSelect, props.disabled, props.onSelect, render]);

  if (!render) return null;

  const {
    disabled,
    forceMount: ___,
    keywords: ____,
    ref: forwardedRef,
    value: _,
    onSelect: __,
    ...etc
  } = props;

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef ?? null])}
      {...etc}
      aria-disabled={Boolean(disabled)}
      aria-selected={Boolean(selected)}
      cmdk-item=""
      data-disabled={Boolean(disabled)}
      data-selected={Boolean(selected)}
      id={id}
      onClick={disabled ? undefined : onSelect}
      onPointerMove={
        disabled || context.getDisablePointerSelection() ? undefined : select
      }
      role="option"
    >
      {props.children}
    </Primitive.div>
  );
};

/**
 * Group command menu items together with a heading. Grouped items are always
 * shown together.
 */
const Group = (
  props: { children?: React.ReactNode } & Omit<
    React.ComponentPropsWithRef<typeof Primitive.div>,
    'heading' | 'value'
  > & {
      /** Whether this group is forcibly rendered regardless of filtering. */
      forceMount?: boolean;
      /** Optional heading to render for this group. */
      heading?: React.ReactNode;
      /**
       * If no heading is provided, you must provide a value that is unique for
       * this group.
       */
      value?: string;
    }
) => {
  const { children, forceMount, heading, ref: forwardedRef, ...etc } = props;
  const id = React.useId();
  const ref = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLDivElement>(null);
  const headingId = React.useId();
  const context = useCommand();
  const render = useCmdk((state) =>
    forceMount
      ? true
      : !context.filter()
        ? true
        : state.search
          ? state.filtered.groups.has(id)
          : true
  );

  useLayoutEffect(() => context.group(id), [context, id]);

  useValue(id, ref, [props.value, props.heading, headingRef]);

  const contextValue = React.useMemo(
    () => ({ id, forceMount }),
    [forceMount, id]
  );

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef ?? null])}
      {...etc}
      cmdk-group=""
      hidden={render ? undefined : true}
      role="presentation"
    >
      {heading && (
        <div aria-hidden cmdk-group-heading="" id={headingId} ref={headingRef}>
          {heading}
        </div>
      )}

      {slottableWithNestedChildren(props, (child) => (
        <div
          aria-labelledby={heading ? headingId : undefined}
          cmdk-group-items=""
          role="group"
        >
          <GroupContext value={contextValue}>{child}</GroupContext>
        </div>
      ))}
    </Primitive.div>
  );
};

/**
 * A visual and semantic separator between items or groups. Visible when the
 * search query is empty or `alwaysRender` is true, hidden otherwise.
 */
const Separator = (
  props: React.ComponentPropsWithRef<typeof Primitive.div> & {
    /**
     * Whether this separator should always be rendered. Useful if you disable
     * automatic filtering.
     */
    alwaysRender?: boolean;
  }
) => {
  const { alwaysRender, ref: forwardedRef, ...etc } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const render = useCmdk((state) => !state.search);

  if (!alwaysRender && !render) return null;

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef ?? null])}
      {...etc}
      cmdk-separator=""
      role="separator"
    />
  );
};

/**
 * Command menu input. All props are forwarded to the underyling `input`
 * element.
 */
const Input = (
  props: Omit<
    React.ComponentPropsWithRef<typeof Primitive.input>,
    'onChange' | 'type' | 'value'
  > & {
    /** Optional controlled state for the value of the search input. */
    value?: string;
    /** Event handler called when the search value changes. */
    onValueChange?: (search: string) => void;
  }
) => {
  const { onValueChange, ref: forwardedRef, ...etc } = props;
  const isControlled = props.value != null;
  const store = useStore();
  const search = useCmdk((state) => state.search);
  const value = useCmdk((state) => state.value);
  const context = useCommand();
  const [selectedItemId, setSelectedItemId] = React.useState<string>();

  useLayoutEffect(() => {
    const item = context.listInnerRef.current?.querySelector(
      `${ITEM_SELECTOR}[aria-selected="true"]`
    );

    setSelectedItemId(item?.getAttribute('id') ?? undefined);
  }, [context.listInnerRef, value]);

  React.useEffect(() => {
    if (props.value != null) {
      store.setState('search', props.value);
    }
  }, [props.value, store]);

  return (
    <Primitive.input
      ref={forwardedRef}
      {...etc}
      aria-activedescendant={selectedItemId}
      aria-autocomplete="list"
      aria-controls={context.listId}
      aria-expanded={true}
      aria-labelledby={context.labelId}
      autoComplete="off"
      autoCorrect="off"
      cmdk-input=""
      id={context.inputId}
      onChange={(e) => {
        if (!isControlled) {
          store.setState('search', e.target.value);
        }

        onValueChange?.(e.target.value);
      }}
      role="combobox"
      spellCheck={false}
      type="text"
      value={isControlled ? props.value : search}
    />
  );
};

/**
 * Contains `Item`, `Group`, and `Separator`. Use the `--cmdk-list-height` CSS
 * variable to animate height based on the number of results.
 */
const List = (
  props: { children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {
      /** Accessible label for this List of suggestions. Not shown visibly. */
      label?: string;
    }
) => {
  const { children, label = 'Suggestions', ref: forwardedRef, ...etc } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  const height = React.useRef<HTMLDivElement>(null);
  const context = useCommand();

  React.useEffect(() => {
    if (height.current && ref.current) {
      const el = height.current;
      const wrapper = ref.current;
      let animationFrame = 0;
      const observer = new ResizeObserver(() => {
        animationFrame = requestAnimationFrame(() => {
          const innerHeight = el.offsetHeight;
          wrapper.style.setProperty(
            '--cmdk-list-height',
            `${innerHeight.toFixed(1)}px`
          );
        });
      });
      observer.observe(el);

      return () => {
        cancelAnimationFrame(animationFrame);
        observer.unobserve(el);
      };
    }

    return undefined;
  }, []);

  return (
    <Primitive.div
      ref={mergeRefs([ref, forwardedRef ?? null])}
      {...etc}
      aria-label={label}
      cmdk-list=""
      id={context.listId}
      role="listbox"
    >
      {slottableWithNestedChildren(props, (child) => (
        <div cmdk-list-sizer="" ref={mergeRefs([height, context.listInnerRef])}>
          {child}
        </div>
      ))}
    </Primitive.div>
  );
};

/** Renders the command menu in a Radix Dialog. */
const Dialog = (
  props: RadixDialog.DialogProps &
    ({ children?: React.ReactNode } & React.ComponentPropsWithRef<
      typeof Primitive.div
    > & {
        /** Optional default item value when it is initially rendered. */
        defaultValue?: string;
        /** Optionally set to `true` to disable selection via pointer events. */
        disablePointerSelection?: boolean;
        /** Accessible label for this command menu. Not shown visibly. */
        label?: string;
        /**
         * Optionally set to `true` to turn on looping around when using the arrow
         * keys.
         */
        loop?: boolean;
        /**
         * Optionally set to `false` to turn off the automatic filtering and
         * sorting. If `false`, you must conditionally render valid items based on
         * the search query yourself.
         */
        shouldFilter?: boolean;
        /** Optional controlled state of the selected command menu item. */
        value?: string;
        /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
        vimBindings?: boolean;
        /**
         * Custom filter function for whether each command menu item should matches
         * the given search query. It should return a number between 0 and 1, with 1
         * being the best match and 0 being hidden entirely. By default, uses the
         * `command-score` library.
         */
        filter?: (value: string, search: string, keywords?: string[]) => number;
        /** Event handler called when the selected item of the menu changes. */
        onValueChange?: (value: string) => void;
      }) & {
      /** Provide a custom element the Dialog should portal into. */
      container?: HTMLElement;
      /** Provide a className to the Dialog content. */
      contentClassName?: string;
      /** Provide a className to the Dialog overlay. */
      overlayClassName?: string;
    }
) => {
  const {
    container,
    contentClassName,
    open,
    overlayClassName,
    ref: forwardedRef,
    ...etc
  } = props;

  return (
    <RadixDialog.Root
      onOpenChange={(nextOpen) => props.onOpenChange?.(nextOpen)}
      open={open}
    >
      <RadixDialog.Portal container={container}>
        <RadixDialog.Overlay className={overlayClassName} cmdk-overlay="" />
        <RadixDialog.Content
          aria-label={props.label}
          className={contentClassName}
          cmdk-dialog=""
        >
          <Command ref={forwardedRef} {...etc} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

/** Automatically renders when there are no results for the search query. */
const Empty = (
  props: { children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {}
) => {
  const render = useCmdk((state) => state.filtered.count === 0);
  const { ref, ...rest } = props;

  if (!render) return null;

  return (
    <Primitive.div ref={ref} {...rest} cmdk-empty="" role="presentation" />
  );
};

/**
 * You should conditionally render this with `progress` while loading
 * asynchronous items.
 */
const Loading = (
  props: { children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {
      /** Accessible label for this loading progressbar. Not shown visibly. */
      label?: string;
      /** Estimated progress of loading asynchronous options. */
      progress?: number;
    }
) => {
  const {
    children,
    label = 'Loading...',
    progress,
    ref: forwardedRef,
    ...etc
  } = props;

  return (
    <Primitive.div
      ref={forwardedRef}
      {...etc}
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      cmdk-loading=""
      role="progressbar"
    >
      {slottableWithNestedChildren(props, (child) => (
        <div aria-hidden>{child}</div>
      ))}
    </Primitive.div>
  );
};

const pkg = Object.assign(Command, {
  Dialog,
  Empty,
  Group,
  Input,
  Item,
  List,
  Loading,
  Separator,
});

export { useCmdk as useCommandState };

export { pkg as Command };

export { defaultFilter };

export { Command as CommandRoot };

export { List as CommandList };

export { Item as CommandItem };

export { Input as CommandInput };

export { Group as CommandGroup };

export { Separator as CommandSeparator };

export { Dialog as CommandDialog };

export { Empty as CommandEmpty };

export { Loading as CommandLoading };

/** Helpers */

function findNextSibling(el: Element, selector: string) {
  let sibling = el.nextElementSibling;

  while (sibling) {
    if (sibling.matches(selector)) return sibling;

    sibling = sibling.nextElementSibling;
  }

  return undefined;
}

function findPreviousSibling(el: Element, selector: string) {
  let sibling = el.previousElementSibling;

  while (sibling) {
    if (sibling.matches(selector)) return sibling;

    sibling = sibling.previousElementSibling;
  }

  return undefined;
}

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data);

  useLayoutEffect(() => {
    ref.current = data;
  });

  return ref;
}

const useLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T>(undefined);

  if (ref.current === undefined) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

// ESM is still a nightmare with Next.js so I'm just gonna copy the package code in
// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T>(refs: Array<React.Ref<T>>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}

/** Run a selector against the store state. */
function useCmdk<T>(selector: (state: State) => T): T {
  const store = useStore();
  const cb = () => selector(store.snapshot());

  return React.useSyncExternalStore(store.subscribe, cb, cb);
}

function useValue(
  id: string,
  ref: React.RefObject<HTMLElement | null>,
  deps: Array<React.ReactNode | React.RefObject<HTMLElement | null> | string>,
  aliases: string[] = []
) {
  const valueRef = React.useRef<string>(undefined);
  const context = useCommand();

  useLayoutEffect(() => {
    const value = (() => {
      for (const part of deps) {
        if (typeof part === 'string') {
          return part.trim();
        }
        if (typeof part === 'object' && part !== null && 'current' in part) {
          if (part.current) {
            return part.current.textContent?.trim();
          }

          return valueRef.current;
        }
      }

      return undefined;
    })();

    const keywords = aliases.map((alias) => alias.trim());

    if (value === undefined) return;

    context.value(id, value, keywords);
    ref.current?.setAttribute(VALUE_ATTR, value);
    valueRef.current = value;
  });
}

/** Imperatively run a function on the next layout effect cycle. */
const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<object>();
  const fns = React.useRef(new Map<number | string, () => void>());

  useLayoutEffect(() => {
    for (const f of fns.current.values()) {
      f();
    }
    fns.current.clear();
  }, [fns, s]);

  return React.useCallback(
    (id: number | string, cb: () => void) => {
      fns.current.set(id, cb);
      ss({});
    },
    [fns]
  );
};

type SlottableElementProps = {
  children?: React.ReactNode;
  ref?: React.Ref<unknown>;
};
type RenderComponent = (props: SlottableElementProps) => React.ReactNode;

function isRenderComponent(value: unknown): value is RenderComponent {
  return typeof value === 'function';
}

function renderChildren(children: React.ReactElement<SlottableElementProps>) {
  const childrenType: unknown = children.type;
  let rendered: React.ReactNode = children;

  // The children is a component
  if (isRenderComponent(childrenType)) {
    rendered = childrenType(children.props);
  }
  return React.isValidElement<SlottableElementProps>(rendered)
    ? rendered
    : children;
}

function slottableWithNestedChildren(
  { asChild, children }: { asChild?: boolean; children?: React.ReactNode },
  render: (child: React.ReactNode) => JSX.Element
) {
  if (asChild && React.isValidElement<SlottableElementProps>(children)) {
    const element = renderChildren(children);
    const ref =
      children.props.ref ??
      (
        children as React.ReactElement<SlottableElementProps> & {
          ref?: React.Ref<unknown>;
        }
      ).ref;

    return React.cloneElement(
      element,
      { ref },
      render(children.props.children)
    );
  }

  return render(children);
}

const srOnlyStyles = {
  borderWidth: '0',
  clip: 'rect(0, 0, 0, 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;
