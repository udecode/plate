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
import type { PluginReference, PluginTransaction } from 'platejs';
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

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string
) => boolean;

type InlineComboboxContextValue = {
  box: UseComboboxReturn;
  filter: FilterFn | false;
  match: ComboboxMatch | null;
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

/** The text typed after the trigger, or `''` when no trigger is active. */
const useInlineComboboxQuery = () =>
  useInlineComboboxContext().match?.query ?? '';

const defaultFilter: FilterFn = (
  { group, keywords = [], label, value },
  search
) => {
  const uniqueTerms = new Set(
    [value, ...keywords, group, label].flatMap((term) =>
      typeof term === 'string' ? [term] : []
    )
  );

  return Array.from(uniqueTerms).some((keyword) =>
    filterWords(keyword, search)
  );
};

const InlineCombobox = <P extends PluginReference>({
  children,
  editableRef,
  filter = defaultFilter,
  hideWhenNoValue = false,
  plugin,
}: {
  children: React.ReactNode;
  editableRef: React.RefObject<HTMLDivElement | null>;
  plugin: UseComboboxOptions<P>['plugin'];
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
}) => {
  // Without a text input, a null active id would point at no option.
  const store = useComboboxStore({ includesBaseElement: false });
  const activeId = useStoreState(store, 'activeId');
  const items = useStoreState(store, 'items');
  const moves = useStoreState(store, 'moves');
  const renderedItems = useStoreState(store, 'renderedItems');
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (store.getState().renderedItems.length === 0) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const down = event.key === 'ArrowDown';
        const next = down ? store.next() : store.previous();

        store.move(next ?? (down ? store.first() : store.last()));

        return true;
      }
      if (event.key !== 'Enter' && event.key !== 'Tab') return false;

      const { activeId: currentId, items: options } = store.getState();
      const option = (
        options.find((item) => item.id === currentId) ??
        options.find((item) => item.id === store.first())
      )?.element;

      if (!option) return false;

      option.click();

      return true;
    },
    [store]
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
    const { activeId: id } = store.getState();

    if (!id) {
      store.setActiveId(store.first());
    } else if (!renderedItems.some((item) => item.id === id)) {
      // A move scrolls the first option back into view; opening stays still.
      store.move(store.first());
    }
  }, [renderedItems, store]);

  // Ariakit scrolls on move only from its own Combobox input, which the
  // editor replaces. Scroll without focusing so the editor keeps focus.
  React.useEffect(() => {
    if (!moves) return;

    const { activeId: id } = store.getState();

    store.item(id)?.element?.scrollIntoView({
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
    () => ({ box, filter, match, setHasEmpty }),
    [box, filter, match]
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
  const { box, match } = useInlineComboboxContext();
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
          'cn-command cn-command-list z-500 w-[300px] overflow-x-hidden overflow-y-auto shadow-md',
          className
        )}
        autoFocusOnHide={false}
        autoFocusOnShow={false}
        getAnchorRect={getAnchorRect}
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
  group,
  keywords,
  label,
  onClick,
  onSelect,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'value'> & {
  focusEditor?: boolean;
  group?: string;
  keywords?: string[];
  label?: string;
  value: string;
  /** Insert the completion. Return false to refuse and keep the query. */
  onSelect?: (tx: PluginTransaction) => false | void;
}) => {
  const { value } = props;
  const editor = useEditor();
  const { box, filter, match } = useInlineComboboxContext();
  const search = match?.query ?? '';
  const visible = React.useMemo(
    () => !filter || filter({ group, keywords, label, value }, search),
    [filter, group, keywords, label, value, search]
  );

  if (!visible || !match) return null;

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

  return <div className={cn('cn-command-empty', className)}>{children}</div>;
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
  useInlineComboboxQuery,
};
