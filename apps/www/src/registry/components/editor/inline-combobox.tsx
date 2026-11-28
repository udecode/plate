'use client';

import {
  FloatingPortal,
  type VirtualElement,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import type { PluginReference } from 'platejs';
import { filterWords } from 'platejs/combobox';
import {
  type ComboboxMatch,
  type UseComboboxOptions,
  type UseComboboxReturn,
  useCombobox,
} from 'platejs/combobox/react';
import { useComposedRef, useEditor } from 'platejs/react';
import * as React from 'react';

type InlineComboboxContextValue = {
  activeId: string | null;
  box: UseComboboxReturn;
  editableRef: React.RefObject<HTMLDivElement | null>;
  itemCount: number;
  match: ComboboxMatch | null;
  open: boolean;
  registerContent: (node: HTMLDivElement | null) => void;
  registerItem: () => () => void;
  setHasEmpty: (hasEmpty: boolean) => void;
  onOptionPointerMove: (
    id: string,
    event: React.PointerEvent<HTMLDivElement>
  ) => void;
  onUserScroll: () => void;
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

const EMPTY_RECT = Object.freeze({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
});

// The popup's DOM holds the option order, because `rankOptions` can reorder
// already-mounted keyed items on any query without remounting them.
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
  const [items, setItems] = React.useState({ count: 0, version: 0 });
  const [hasEmpty, setHasEmpty] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [shown, setShown] = React.useState(false);
  const activeIdRef = React.useRef<string | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const followFirstOption = React.useRef(true);
  const lastPointer = React.useRef<{ x: number; y: number } | null>(null);
  const prevQuery = React.useRef('');

  const registerItem = React.useCallback(() => {
    setItems((prev) => ({ count: prev.count + 1, version: prev.version + 1 }));

    return () => {
      setItems((prev) => ({
        count: Math.max(0, prev.count - 1),
        version: prev.version + 1,
      }));
    };
  }, []);

  const registerContent = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);

  const onUserScroll = React.useCallback(() => {
    followFirstOption.current = false;
  }, []);

  const setActiveOptionId = React.useCallback((nextId: string | null) => {
    if (activeIdRef.current !== nextId) {
      activeIdRef.current = nextId;
      setActiveId(nextId);
    }
  }, []);

  const activateOption = React.useCallback(
    (option: HTMLElement, scroll: boolean) => {
      setActiveOptionId(option.id);
      if (scroll) {
        option.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    },
    [setActiveOptionId]
  );

  const onOptionPointerMove = React.useCallback(
    (id: string, event: React.PointerEvent<HTMLDivElement>) => {
      if (!id || event.pointerType === 'touch') return;

      const prev = lastPointer.current;

      if (prev && prev.x === event.clientX && prev.y === event.clientY) {
        return;
      }

      lastPointer.current = { x: event.clientX, y: event.clientY };
      followFirstOption.current = false;
      activateOption(event.currentTarget, false);
    },
    [activateOption]
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (loading) {
        return event.key === 'Enter' || event.key === 'Tab';
      }

      const options = getOptions(contentRef.current);

      if (options.length === 0) return false;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const index = options.findIndex(
          (option) => option.id === activeIdRef.current
        );
        const next =
          event.key === 'ArrowDown'
            ? (options[index + 1] ?? options[0])
            : (options[index - 1] ?? options.at(-1));

        followFirstOption.current = false;
        if (next) activateOption(next, true);

        return true;
      }
      if (event.key !== 'Enter' && event.key !== 'Tab') return false;

      (
        options.find((option) => option.id === activeIdRef.current) ??
        options[0]
      ).click();

      return true;
    },
    [activateOption, loading]
  );

  const effectiveActiveId = shown ? activeId : null;
  const box = useCombobox({
    activeOptionId: effectiveActiveId,
    editableRef,
    onKeyDown,
    open: shown,
    plugin,
  });
  const { dismiss, match } = box;
  const query = match?.query ?? '';
  const active = !!match && (!hideWhenNoValue || query.length > 0);
  const open = active && (items.count > 0 || hasEmpty);

  if (shown !== open) setShown(open);

  React.useLayoutEffect(() => {
    const queryChanged = prevQuery.current !== query;

    prevQuery.current = query;

    if (!open) {
      activeIdRef.current = null;
      followFirstOption.current = true;
      lastPointer.current = null;
      contentRef.current?.scrollTo({ top: 0 });

      return;
    }
    if (queryChanged) {
      followFirstOption.current = true;
    }

    const options = getOptions(contentRef.current);
    const first = options[0];

    if (!first) {
      setActiveOptionId(null);

      return;
    }

    const id = activeIdRef.current;

    if (!id) {
      activateOption(first, false);
    } else if (id === first.id) {
      if (queryChanged) activateOption(first, true);
    } else if (
      followFirstOption.current ||
      !options.some((option) => option.id === id)
    ) {
      activateOption(first, true);
    }
  }, [activateOption, items.version, open, query, setActiveOptionId]);

  const trailingSpace =
    !!match && !match.composing && !loading && /\s$/.test(query);

  React.useEffect(() => {
    if (!trailingSpace) return;

    const content = contentRef.current;

    if (!content) return;
    if (getOptions(content).length === 0) dismiss();
  }, [dismiss, items.version, query, trailingSpace]);

  const contextValue = React.useMemo<InlineComboboxContextValue>(
    () => ({
      activeId: effectiveActiveId,
      box,
      editableRef,
      itemCount: items.count,
      match,
      onOptionPointerMove,
      onUserScroll,
      open,
      registerContent,
      registerItem,
      setHasEmpty,
    }),
    [
      box,
      editableRef,
      effectiveActiveId,
      items.count,
      match,
      onOptionPointerMove,
      onUserScroll,
      open,
      registerContent,
      registerItem,
    ]
  );

  return (
    <InlineComboboxContext value={contextValue}>
      {active ? children : null}
    </InlineComboboxContext>
  );
};

const InlineComboboxContent = ({
  className,
  onMouseDown,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const editor = useEditor();
  const { box, editableRef, match, onUserScroll, open, registerContent } =
    useInlineComboboxContext();
  const listboxRef = React.useRef<HTMLDivElement | null>(null);
  const getAnchorRect = React.useCallback(() => {
    if (!match) return null;

    const start = match.range.anchor;

    return editor.api.dom.resolveRangeRect({ anchor: start, focus: start });
  }, [editor, match]);
  const getAnchorRectRef = React.useRef(getAnchorRect);

  React.useLayoutEffect(() => {
    getAnchorRectRef.current = getAnchorRect;
  });

  const { context, floatingStyles, isPositioned, refs, update } =
    useFloating<VirtualElement>({
      middleware: [
        offset(0),
        flip(),
        shift({ padding: 8 }),
        size({
          apply({ availableHeight, elements }) {
            elements.floating.style.setProperty(
              '--popover-available-height',
              `${Math.max(0, availableHeight)}px`
            );
          },
          padding: 8,
        }),
      ],
      open,
      placement: 'bottom-start',
      whileElementsMounted: autoUpdate,
      onOpenChange: (nextOpen) => {
        if (!nextOpen) box.dismiss();
      },
    });

  React.useLayoutEffect(() => {
    const editable = editableRef.current;

    refs.setPositionReference({
      contextElement: editable ?? undefined,
      getBoundingClientRect: () =>
        getAnchorRectRef.current() ??
        editable?.getBoundingClientRect() ??
        EMPTY_RECT,
    });
  }, [editableRef, refs]);

  React.useLayoutEffect(() => {
    if (open) update();
  }, [match, open, update]);

  React.useEffect(() => {
    if (!open) return undefined;

    const view = editableRef.current?.ownerDocument.defaultView;
    const viewport = view?.visualViewport;

    if (!viewport) return undefined;

    const onResize = () => update();

    viewport.addEventListener('resize', onResize, { passive: true });

    return () => {
      viewport.removeEventListener('resize', onResize);
    };
  }, [editableRef, open, update]);

  React.useEffect(() => {
    if (!open) return undefined;

    const doc = editableRef.current?.ownerDocument ?? document;
    const onFocusIn = (event: FocusEvent) => {
      const { target } = event;

      if (!(target instanceof Node)) return;
      if (
        editableRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return;
      }

      box.dismiss();
    };

    doc.addEventListener('focusin', onFocusIn);

    return () => {
      doc.removeEventListener('focusin', onFocusIn);
    };
  }, [box, editableRef, open]);

  const [listboxElement, setListboxElement] =
    React.useState<HTMLDivElement | null>(null);
  const onUserScrollRef = React.useRef(onUserScroll);

  React.useLayoutEffect(() => {
    onUserScrollRef.current = onUserScroll;
  });

  React.useEffect(() => {
    if (!listboxElement) return undefined;

    const options = { capture: true, passive: true };
    const handleScroll = () => onUserScrollRef.current();

    listboxElement.addEventListener('wheel', handleScroll, options);
    listboxElement.addEventListener('touchmove', handleScroll, options);

    return () => {
      listboxElement.removeEventListener('wheel', handleScroll, options);
      listboxElement.removeEventListener('touchmove', handleScroll, options);
    };
  }, [listboxElement]);

  const dismissInteraction = useDismiss(context, {
    escapeKey: false,
    outsidePress: (event) =>
      !(event.target instanceof Node) ||
      !editor.api.dom.root()?.contains(event.target),
  });
  const { getFloatingProps } = useInteractions([dismissInteraction]);
  const floatingRef = useComposedRef(refs.setFloating);
  const setListboxRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listboxRef.current = node;
      setListboxElement(node);
      registerContent(node);
    },
    [registerContent]
  );

  return (
    <FloatingPortal preserveTabOrder={false}>
      <div
        ref={floatingRef}
        className="z-500"
        hidden={!open}
        style={{
          ...floatingStyles,
          minWidth: 'max-content',
          transform: isPositioned
            ? floatingStyles.transform
            : 'translate(0, -200%)',
        }}
        {...getFloatingProps()}
      >
        <div
          {...props}
          id={box.listboxId}
          ref={setListboxRef}
          className={cn(
            'cn-command cn-command-list cn-menu-target cn-menu-translucent max-h-[min(--spacing(72),var(--popover-available-height,--spacing(72)))] w-[300px] overflow-x-hidden overflow-y-auto shadow-md',
            className
          )}
          role="listbox"
          tabIndex={-1}
          // Keep the editor focused unless an IME is composing: the blur ends it.
          onMouseDown={(event) => {
            if (!match?.composing) event.preventDefault();
            onMouseDown?.(event);
          }}
        />
      </div>
    </FloatingPortal>
  );
};

const comboboxItemVariants = cva(
  'cn-command-item mx-1 h-7 cursor-pointer text-foreground transition-colors data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground'
);

const InlineComboboxItem = ({
  className,
  focusEditor = true,
  id: providedId,
  onClick,
  onPointerMove,
  onSelect,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  focusEditor?: boolean;
  /** Insert the completion. Return false to refuse and keep the query. */
  onSelect?: Parameters<UseComboboxReturn['complete']>[1];
}) => {
  const editor = useEditor();
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const { activeId, box, match, onOptionPointerMove, registerItem } =
    useInlineComboboxContext();

  React.useLayoutEffect(() => {
    if (!match) return undefined;

    return registerItem();
  }, [match, registerItem]);

  if (!match) return null;

  const isActive = activeId === id;

  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events -- Keyboard selection stays on the combobox editor root via aria-activedescendant.
    <div
      {...props}
      id={id}
      aria-selected={isActive}
      className={cn(comboboxItemVariants(), className)}
      data-active-item={isActive ? 'true' : undefined}
      role="option"
      tabIndex={-1}
      onClick={(event) => {
        if (!box.complete(match, (tx) => onSelect?.(tx))) return;
        if (focusEditor) editor.api.dom.focus();
        onClick?.(event);
      }}
      onPointerMove={(event) => {
        onOptionPointerMove(id, event);
        onPointerMove?.(event);
      }}
    />
  );
};

const InlineComboboxEmpty = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { itemCount, setHasEmpty } = useInlineComboboxContext();

  React.useLayoutEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (itemCount > 0) return null;

  return (
    <div className={cn('cn-command-empty', className)} {...props}>
      {children}
    </div>
  );
};

type InlineComboboxGroupContextValue = {
  labelId: string;
  setHasLabel: (hasLabel: boolean) => void;
};

const InlineComboboxGroupContext =
  React.createContext<InlineComboboxGroupContextValue | null>(null);

function InlineComboboxGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const labelId = React.useId();
  const [hasLabel, setHasLabel] = React.useState(false);
  const value = React.useMemo(() => ({ labelId, setHasLabel }), [labelId]);

  return (
    <InlineComboboxGroupContext value={value}>
      <div
        {...props}
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn(
          'cn-command-group hidden not-last:border-b [&:has([role=option])]:block',
          className
        )}
        role="group"
      />
    </InlineComboboxGroupContext>
  );
}

function InlineComboboxGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const group = React.useContext(InlineComboboxGroupContext);

  React.useLayoutEffect(() => {
    group?.setHasLabel(true);

    return () => {
      group?.setHasLabel(false);
    };
  }, [group]);

  return (
    <div
      {...props}
      id={group?.labelId}
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
  useInlineComboboxQuery,
};
