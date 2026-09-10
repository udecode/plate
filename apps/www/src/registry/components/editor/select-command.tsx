'use client';

import { Primitive } from '@radix-ui/react-primitive';
import { Slottable } from '@radix-ui/react-slot';
import type { JSX } from 'react';
import * as React from 'react';

type Actions = {
  selectCurrentItem: () => void;
  selectFirstItem: () => void;
  setSearch: (search: string) => void;
};

type Context = {
  // Ids
  listId: string;
  // Refs
  listInnerRef: React.RefObject<HTMLDivElement | null>;
  getDisablePointerSelection: () => boolean;
  getValue: (id: string) => string | undefined;
  item: (id: string) => () => void;
  value: (id: string, value: string) => void;
};
type State = {
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
const GROUP_HEADING_SELECTOR = `[cmdk-group-heading=""]`;
const ITEM_SELECTOR = `[cmdk-item=""]`;
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const SELECT_EVENT = 'cmdk-item-select';
const VALUE_ATTR = 'data-value';
const CommandContext = React.createContext<Context | undefined>(undefined);
const useCommand = () => {
  const context = React.useContext(CommandContext);

  if (!context) {
    throw new Error('Command components must be used within Command');
  }

  return context;
};
const StoreContext = React.createContext<Store | undefined>(undefined);
const ActionsContext = React.createContext<Actions | undefined>(undefined);
const useStore = () => {
  const store = React.useContext(StoreContext);

  if (!store) {
    throw new Error('Command components must be used within Command');
  }

  return store;
};

export const useCommandActions = () => {
  const context = React.useContext(ActionsContext);

  if (context === undefined) {
    throw new Error(
      'useCommandActions must be used within a Command component'
    );
  }

  return context;
};

const CommandRoot = (
  props: { children?: React.ReactNode } & React.ComponentPropsWithRef<
    typeof Primitive.div
  > & {
      /** Optional default item value when it is initially rendered. */
      defaultValue?: string;
      /** Optionally set to `true` to disable selection via pointer events. */
      disablePointerSelection?: boolean;
      /**
       * Optionally set to `true` to turn on looping around when using the arrow
       * keys.
       */
      loop?: boolean;
      /** Optional controlled state of the selected command menu item. */
      value?: string;
      /** Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`. */
      vimBindings?: boolean;
      /** Event handler called when the selected item of the menu changes. */
      onValueChange?: (value: string) => void;
    }
) => {
  const state = useLazyRef<State>(() => ({
    /** Value of the search query. */
    search: '',
    /** Currently selected item value. */
    value: props.value ?? props.defaultValue ?? '',
  }));
  const ids = useLazyRef<Map<string, string>>(() => new Map());
  // [...rerenders]
  const listeners = useLazyRef<Set<() => void>>(() => new Set());
  const propsRef = useAsRef(props);
  const {
    children,
    loop,
    ref: forwardedRef,
    value,
    vimBindings = true,
    onValueChange,
    ...etc
  } = props;

  const listId = React.useId();

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
    listId,
    listInnerRef,
    getDisablePointerSelection: () =>
      propsRef.current.disablePointerSelection ?? false,
    getValue: (id) => ids.current.get(id),
    // Track item lifecycle (mount, unmount)
    item: (id) => {
      // Publish once when several items mount in the same render.
      schedule(3, () => {
        // Could be initial mount, select the first item if none already selected
        if (!state.current.value) {
          selectFirstItem();
        }

        store.emit();
      });

      return () => {
        ids.current.delete(id);
        const selectedItem = getSelectedItem();

        // Batch this, multiple items could be removed in one pass
        schedule(4, () => {
          // The item removed have been the selected one,
          // so selection should be moved to the first
          if (selectedItem?.getAttribute('id') === id) selectFirstItem();

          store.emit();
        });
      };
    },
    value: (id, innerValue2) => {
      if (innerValue2 !== ids.current.get(id)) {
        ids.current.set(id, innerValue2);
        schedule(2, () => {
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

  function selectFirstItem() {
    const item = getValidItems().find(
      (innerItem) => innerItem.getAttribute('aria-disabled') !== 'true'
    );
    const innerValue5 = item?.getAttribute(VALUE_ATTR);
    store.setState('value', innerValue5 ?? undefined);
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
    setSearch,
  })).current;

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
      {slottableWithNestedChildren(props, (child) => (
        <StoreContext value={store}>
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
  const context = useCommand();
  const propsRef = useAsRef(props);

  useLayoutEffect(() => context.item(id), [context, id]);

  useValue(id, ref, [props.value, props.children, ref]);

  const store = useStore();
  const selected = useCmdk(
    (state) => state.value && state.value === context.getValue(id)
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
  }, [onSelect, props.disabled, props.onSelect]);

  const { disabled, ref: forwardedRef, value: _, onSelect: __, ...etc } = props;

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
      /** Optional heading to render for this group. */
      heading?: React.ReactNode;
    }
) => {
  const { children, heading, ref: forwardedRef, ...etc } = props;
  const headingId = React.useId();
  return (
    <Primitive.div
      ref={forwardedRef}
      {...etc}
      cmdk-group=""
      role="presentation"
    >
      {heading && (
        <div aria-hidden cmdk-group-heading="" id={headingId}>
          {heading}
        </div>
      )}

      {slottableWithNestedChildren(props, (child) => (
        <div
          aria-labelledby={heading ? headingId : undefined}
          cmdk-group-items=""
          role="group"
        >
          {child}
        </div>
      ))}
    </Primitive.div>
  );
};

/**
 * Contains `Item` and `Group`. Use the `--cmdk-list-height` CSS
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
        cancelAnimationFrame(animationFrame);
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

export const Command = Object.assign(CommandRoot, { Group, Item, List });

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
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') return ref(value);
      if (ref) ref.current = value;
      return undefined;
    });

    return () => {
      cleanups.forEach((cleanup, index) => {
        const ref = refs[index];
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      });
    };
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
  deps: Array<React.ReactNode | React.RefObject<HTMLElement | null> | string>
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

    if (value === undefined) return;

    context.value(id, value);
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

function slottableWithNestedChildren(
  { asChild, children }: { asChild?: boolean; children?: React.ReactNode },
  render: (child: React.ReactNode) => JSX.Element
) {
  if (
    asChild &&
    React.isValidElement<{ children?: React.ReactNode }>(children)
  ) {
    return (
      <Slottable>
        {React.cloneElement(
          children,
          undefined,
          render(children.props.children)
        )}
      </Slottable>
    );
  }

  return render(children);
}
