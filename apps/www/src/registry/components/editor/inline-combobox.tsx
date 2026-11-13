'use client';

import {
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
  useComboboxContext,
  useComboboxStore,
  useStoreState,
} from '@ariakit/react';
import { cva } from 'class-variance-authority';
import type { PluginReference } from 'platejs';
import { filterWords } from 'platejs/combobox';
import {
  type ComboboxMatch,
  type UseComboboxOptions,
  type UseComboboxReturn,
  useCombobox,
} from 'platejs/combobox/react';
import { useEditor } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type InlineComboboxContextValue = {
  box: UseComboboxReturn;
  match: ComboboxMatch | null;
  open: boolean;
  setHasEmpty: (hasEmpty: boolean) => void;
};

const InlineComboboxContext =
  React.createContext<InlineComboboxContextValue | null>(null);

const useInlineComboboxContext = () => {
  const context = React.useContext(InlineComboboxContext);

  if (!context) {
    throw new Error('Inline combobox components require InlineCombobox');
  }

  return context;
};

const useInlineComboboxOpen = () => useInlineComboboxContext().open;

/** The text typed after the trigger, or `''` when no trigger is active. */
const useInlineComboboxQuery = () =>
  useInlineComboboxContext().match?.query ?? '';

type RankedOption = {
  label: string;
  group?: string;
  keywords?: readonly string[];
};

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  usage: 'search',
});

const sameText = (a: string, b: string) => collator.compare(a, b) === 0;

const toWords = (text: string) => text.trim().split(/\s+/);

const sameWords = (text: string, words: readonly string[]) => {
  const textWords = toWords(text);

  return (
    textWords.length === words.length &&
    words.every((word, i) => sameText(textWords[i], word))
  );
};

const startsWithWords = (text: string, words: readonly string[]) => {
  const textWords = toWords(text);
  const last = words.length - 1;

  return words.every((word, i) => {
    const textWord = textWords[i];

    return (
      textWord !== undefined &&
      sameText(i === last ? textWord.slice(0, word.length) : textWord, word)
    );
  });
};

const matchBand = (
  { group, keywords = [], label }: RankedOption,
  query: string,
  words: readonly string[]
) => {
  if (
    sameWords(label, words) ||
    keywords.some((keyword) => sameWords(keyword, words))
  ) {
    return 0;
  }
  if (filterWords(label, query)) {
    return startsWithWords(label, words) ? 1 : 2;
  }
  if (keywords.some((keyword) => filterWords(keyword, query))) return 3;

  return group !== undefined && filterWords(group, query) ? 3 : null;
};

/**
 * The options `query` keeps, best match first: the label or a keyword equals
 * the query, then the label starts with it, then a later word of the label
 * does, then a keyword or the group does. Equal matches keep the given order,
 * and a blank query keeps every option.
 */
const rankOptions = <T extends RankedOption>(
  options: readonly T[],
  query: string
): T[] => {
  const search = query.trim();

  if (!search) return [...options];

  const words = toWords(search);

  return options
    .flatMap((option) => {
      const band = matchBand(option, search, words);

      return band === null ? [] : [{ band, option }];
    })
    .sort((a, b) => a.band - b.band)
    .map(({ option }) => option);
};

// The popup's DOM holds the option order. Ariakit sorts its collection a frame
// after options render and misses a reorder of kept options, which a ranked
// list can make on any query.
const getOptions = (contentElement: HTMLElement | null) =>
  Array.from(
    contentElement?.querySelectorAll<HTMLElement>(
      '[role="option"]:not([aria-disabled="true"])'
    ) ?? []
  );

const InlineCombobox = <P extends PluginReference>({
  children,
  editableRef,
  hideWhenNoValue = false,
  loading = false,
  plugin,
}: {
  children: React.ReactNode;
  editableRef: UseComboboxOptions<P>['editableRef'];
  plugin: UseComboboxOptions<P>['plugin'];
  hideWhenNoValue?: boolean;
  /** Options are still loading: Enter and Tab do nothing. */
  loading?: boolean;
}) => {
  // Without a text input, a null active id would point at no option.
  const store = useComboboxStore({ includesBaseElement: false });
  const activeId = useStoreState(store, 'activeId');
  const items = useStoreState(store, 'items');
  const moves = useStoreState(store, 'moves');
  const renderedItems = useStoreState(store, 'renderedItems');
  // Stands in for Ariakit's autoSelect, which lives on the Combobox input the
  // editor replaces: each query activates the first result until an arrow key
  // or a scroll of the list moves away from it.
  const autoSelect = React.useRef(true);
  const contentElement = useStoreState(store, 'contentElement');
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (loading) {
        return event.key === 'Enter' || event.key === 'Tab';
      }
      const { activeId: currentId, contentElement: content } = store.getState();
      const options = getOptions(content);

      if (options.length === 0) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const index = options.findIndex((option) => option.id === currentId);
        const next =
          event.key === 'ArrowDown'
            ? (options[index + 1] ?? options[0])
            : (options[index - 1] ?? options.at(-1));

        autoSelect.current = false;
        if (next) store.move(next.id);

        return true;
      }
      if (event.key !== 'Enter' && event.key !== 'Tab') return false;

      (options.find((option) => option.id === currentId) ?? options[0]).click();

      return true;
    },
    [loading, store]
  );
  const [shown, setShown] = React.useState(false);
  const box = useCombobox({
    activeOptionId: activeId ?? null,
    editableRef,
    onKeyDown,
    open: shown,
    plugin,
  });
  const { dismiss, match } = box;
  const query = match?.query ?? '';
  const [hasEmpty, setHasEmpty] = React.useState(false);
  const open =
    !!match &&
    (items.length > 0 || hasEmpty) &&
    (!hideWhenNoValue || query.length > 0);

  if (shown !== open) setShown(open);

  React.useEffect(() => {
    store.setAnchorElement(editableRef.current);
  }, [editableRef, store]);

  React.useEffect(() => {
    if (!contentElement) return undefined;

    const stopAutoSelect = () => {
      autoSelect.current = false;
    };
    const options = { capture: true, passive: true };

    contentElement.addEventListener('wheel', stopAutoSelect, options);
    contentElement.addEventListener('touchmove', stopAutoSelect, options);

    return () => {
      contentElement.removeEventListener('wheel', stopAutoSelect, options);
      contentElement.removeEventListener('touchmove', stopAutoSelect, options);
    };
  }, [contentElement]);

  React.useEffect(() => {
    autoSelect.current = true;
  }, [query]);

  // A query commits its options before this runs; renderedItems marks a list
  // that changed without a new query, such as one that finished loading.
  React.useEffect(() => {
    const { activeId: id, contentElement: content } = store.getState();
    const options = getOptions(content);
    const first = options[0]?.id;

    if (!first || id === first) return;
    if (!id) {
      store.setActiveId(first);
    } else if (
      autoSelect.current ||
      !options.some((option) => option.id === id)
    ) {
      // A move scrolls the first option back into view; opening stays still.
      store.move(first);
    }
  }, [query, renderedItems, store]);

  // Ariakit scrolls on move only from its own Combobox input, which the
  // editor replaces. Scroll without focusing so the editor keeps focus.
  React.useEffect(() => {
    if (!moves) return;

    const { activeId: id, contentElement: content } = store.getState();

    getOptions(content)
      .find((option) => option.id === id)
      ?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
  }, [moves, store]);

  const queryBecameProse =
    !!match && !match.composing && items.length === 0 && /\s$/.test(query);

  React.useEffect(() => {
    if (queryBecameProse) dismiss();
  }, [dismiss, queryBecameProse]);

  const contextValue = React.useMemo<InlineComboboxContextValue>(
    () => ({ box, match, open, setHasEmpty }),
    [box, match, open]
  );

  return (
    <ComboboxProvider
      open={open}
      setOpen={(nextOpen) => {
        if (!nextOpen) dismiss();
      }}
      store={store}
      value={query}
    >
      <InlineComboboxContext value={contextValue}>
        {children}
      </InlineComboboxContext>
    </ComboboxProvider>
  );
};

const InlineComboboxContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const editor = useEditor();
  const { box, match, open } = useInlineComboboxContext();
  const getAnchorRect = React.useCallback(() => {
    if (!match) return null;

    const start = match.range.anchor;

    return editor.api.dom.resolveRangeRect({ anchor: start, focus: start });
  }, [editor, match]);

  return (
    <Portal>
      <ComboboxPopover
        id={box.listboxId}
        className={cn(
          'cn-command cn-command-list z-500 max-h-[min(--spacing(72),var(--popover-available-height,--spacing(72)))] w-[300px] overflow-x-hidden overflow-y-auto shadow-md',
          className
        )}
        autoFocusOnHide={false}
        autoFocusOnShow={false}
        getAnchorRect={getAnchorRect}
        // Ariakit keeps a closed popover shown for at least two frames whenever
        // its computed animation or transition duration is nonzero, even a
        // reduced-motion reset's 0.01ms. By then the closed match has removed
        // its options and anchor.
        hidden={!open}
        hideOnEscape={false}
        hideOnInteractOutside={(event) =>
          !(event.target instanceof Node) ||
          !editor.api.dom.root()?.contains(event.target)
        }
        modal={false}
        // Keep the editor focused unless an IME is composing: the blur ends it.
        onMouseDown={(event) => {
          if (!match?.composing) event.preventDefault();
        }}
        {...props}
      />
    </Portal>
  );
};

const comboboxItemVariants = cva(
  'cn-command-item mx-1 h-7 cursor-pointer text-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground'
);

const InlineComboboxItem = ({
  className,
  focusEditor = true,
  onClick,
  onSelect,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  focusEditor?: boolean;
  /** Insert the completion. Return false to refuse and keep the query. */
  onSelect?: Parameters<UseComboboxReturn['complete']>[1];
}) => {
  const editor = useEditor();
  const { box, match } = useInlineComboboxContext();

  if (!match) return null;

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      hideOnClick={false}
      setValueOnClick={false}
      onClick={(event) => {
        if (!box.complete(match, (tx) => onSelect?.(tx))) return;
        if (focusEditor) editor.api.dom.focus();
        onClick?.(event);
      }}
      {...props}
    />
  );
};

const InlineComboboxEmpty = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty } = useInlineComboboxContext();
  const store = useComboboxContext();

  if (store == null) {
    throw new Error('InlineComboboxEmpty requires a Combobox store');
  }

  const items = useStoreState(store, 'items');

  React.useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div className={cn('cn-command-empty', className)} {...props}>
      {children}
    </div>
  );
};

function InlineComboboxGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ComboboxGroup
      {...props}
      className={cn(
        'cn-command-group hidden not-last:border-b [&:has([role=option])]:block',
        className
      )}
    />
  );
}

function InlineComboboxGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ComboboxGroupLabel
      {...props}
      className={cn(
        'mt-1.5 mb-2 px-3 font-medium text-muted-foreground text-xs',
        className
      )}
    />
  );
}

export {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxItem,
  rankOptions,
  useInlineComboboxOpen,
  useInlineComboboxQuery,
};
