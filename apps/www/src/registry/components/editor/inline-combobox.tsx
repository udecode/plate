'use client';

import * as React from 'react';

import type { Anchor, Element, Point } from '@platejs/plite';

import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
  useComboboxContext,
  useComboboxStore,
} from '@ariakit/react';
import { filterWords } from '@platejs/combobox';
import { cva } from 'class-variance-authority';
import { Hotkeys, isHotkey } from 'platejs';
import {
  useComposedRef,
  useEditor,
  useElementSelected,
  usePath,
} from 'platejs/react';

import { cn } from '@/lib/utils';

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string
) => boolean;

type InlineComboboxContextValue = {
  filter: FilterFn | false;
  inputProps: Required<
    Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onKeyDown'>
  >;
  inputRef: React.RefObject<HTMLInputElement | null>;
  removeInput: (focusEditor?: boolean) => void;
  showTrigger: boolean;
  trigger: string;
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

type InlineComboboxProps = {
  children: React.ReactNode;
  element: Element;
  trigger: string;
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
  showTrigger?: boolean;
  value?: string;
  setValue?: (value: string) => void;
};

const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditor();
  const path = usePath();
  const selected = useElementSelected();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [valueState, setValueState] = React.useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  // Check if current user is the creator of this element (for Yjs collaboration)
  const isCreator = React.useMemo(() => {
    const elementUserId = element.userId;
    const currentUserId = editor.runtime.userId;

    // Inputs without a collaboration owner stay editable.
    if (!elementUserId) return true;

    return elementUserId === currentUserId;
  }, [editor.runtime.userId, element]);

  const setValue = React.useCallback(
    (newValue: string) => {
      setValueProp?.(newValue);

      if (!hasValueProp) {
        setValueState(newValue);
      }
    },
    [setValueProp, hasValueProp]
  );

  /**
   * Track the point just before the input element so we know where to
   * insertText if the combobox closes due to a selection change.
   */
  const insertPointAnchor = React.useRef<Anchor<Point> | null>(null);

  React.useEffect(() => {
    insertPointAnchor.current?.release();
    insertPointAnchor.current = null;

    if (!path) return;

    const point = editor.read.points.before(path);

    if (!point) return;

    const nextPointAnchor = editor.anchor(point, {
      association: 'forward',
      deletion: 'drop',
    });
    insertPointAnchor.current = nextPointAnchor;

    return () => {
      if (insertPointAnchor.current === nextPointAnchor) {
        insertPointAnchor.current = null;
      }
      nextPointAnchor.release();
    };
  }, [editor, path]);

  const removedRef = React.useRef(false);
  const removeInput = React.useCallback(
    (focusEditor = false) => {
      if (removedRef.current) return;

      removedRef.current = true;
      editor.update.nodes.remove({ at: element });

      if (focusEditor) editor.api.dom.focus();
    },
    [editor, element]
  );
  const cancelInput = React.useCallback(
    (
      cause:
        | 'arrowLeft'
        | 'arrowRight'
        | 'backspace'
        | 'blur'
        | 'deselect'
        | 'escape',
      focusEditor = false
    ) => {
      if (removedRef.current) return;

      removeInput(focusEditor);

      if (cause === 'backspace') return;

      editor.update((tx) => {
        tx.text.insert(trigger + value, {
          at: insertPointAnchor.current?.resolve() ?? undefined,
        });

        if (cause === 'arrowLeft' || cause === 'arrowRight') {
          tx.selection.move({
            distance: 1,
            reverse: cause === 'arrowLeft',
          });
        }
      });
    },
    [editor, removeInput, trigger, value]
  );

  React.useEffect(() => {
    if (isCreator) inputRef.current?.focus();
  }, [isCreator]);

  const previousSelected = React.useRef(selected);

  React.useEffect(() => {
    if (previousSelected.current && !selected) cancelInput('deselect');

    previousSelected.current = selected;
  }, [cancelInput, selected]);

  const inputProps: InlineComboboxContextValue['inputProps'] = {
    onBlur: () => cancelInput('blur'),
    onKeyDown: (event) => {
      const {
        selectionEnd,
        selectionStart,
        value: inputValue,
      } = event.currentTarget;
      const cursorCollapsed = selectionStart === selectionEnd;
      const cursorAtStart = cursorCollapsed && selectionStart === 0;
      const cursorAtEnd = cursorCollapsed && selectionEnd === inputValue.length;
      const cancelCause = isHotkey('escape')(event)
        ? 'escape'
        : cursorAtStart && isHotkey('backspace')(event)
          ? 'backspace'
          : cursorAtStart && isHotkey('arrowleft')(event)
            ? 'arrowLeft'
            : cursorAtEnd && isHotkey('arrowright')(event)
              ? 'arrowRight'
              : null;

      if (cancelCause) {
        event.preventDefault();
        event.stopPropagation();
        cancelInput(cancelCause, true);

        return;
      }

      const undo =
        Hotkeys.isUndo(event) && editor.read.history.undos().length > 0;
      const redo =
        Hotkeys.isRedo(event) && editor.read.history.redos().length > 0;

      if (undo || redo) {
        event.preventDefault();
        editor.update.history[undo ? 'undo' : 'redo']();
        editor.api.dom.focus();
      }
    },
  };

  const [hasEmpty, setHasEmpty] = React.useState(false);

  const contextValue: InlineComboboxContextValue = React.useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [
      trigger,
      showTrigger,
      filter,
      inputRef,
      inputProps,
      removeInput,
      setHasEmpty,
    ]
  );

  const store = useComboboxStore({
    // open: ,
    setValue: (newValue) => React.startTransition(() => setValue(newValue)),
  });

  const items = store.useState('items');

  /**
   * If there is no active ID and the list of items changes, select the first
   * item.
   */
  React.useEffect(() => {
    if (!store.getState().activeId) {
      store.setActiveId(store.first());
    }
  }, [items, store]);

  return (
    <span contentEditable={false}>
      <ComboboxProvider
        open={
          (items.length > 0 || hasEmpty) &&
          (!hideWhenNoValue || value.length > 0)
        }
        store={store}
      >
        <InlineComboboxContext value={contextValue}>
          {children}
        </InlineComboboxContext>
      </ComboboxProvider>
    </span>
  );
};

const InlineComboboxInput = ({
  className,
  ref: propRef,
  ...props
}: React.HTMLAttributes<HTMLInputElement> & {
  ref?: React.RefObject<HTMLInputElement | null>;
}) => {
  const {
    inputProps,
    inputRef: contextRef,
    showTrigger,
    trigger,
  } = useInlineComboboxContext();

  const store = useComboboxContext()!;
  const value = store.useState('value');

  const ref = useComposedRef(propRef, contextRef);

  /**
   * To create an auto-resizing input, we render a visually hidden span
   * containing the input value and position the input element on top of it.
   * This works well for all cases except when input exceeds the width of the
   * container.
   */

  return (
    <>
      {showTrigger && trigger}

      <span className="relative min-h-[1lh]">
        <span
          className="invisible overflow-hidden text-nowrap"
          aria-hidden="true"
        >
          {value || '\u200B'}
        </span>

        <Combobox
          ref={ref}
          className={cn(
            'absolute top-0 left-0 size-full bg-transparent outline-none',
            className
          )}
          value={value}
          autoSelect
          {...inputProps}
          {...props}
        />
      </span>
    </>
  );
};

InlineComboboxInput.displayName = 'InlineComboboxInput';

const InlineComboboxContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  // Portal prevents CSS from leaking into popover
  const store = useComboboxContext();

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!store) return;

    const state = store.getState();
    const { items, activeId } = state;

    if (!items.length) return;

    const currentIndex = items.findIndex((item) => item.id === activeId);

    if (event.key === 'ArrowUp' && currentIndex <= 0) {
      event.preventDefault();
      store.setActiveId(store.last());
    } else if (event.key === 'ArrowDown' && currentIndex >= items.length - 1) {
      event.preventDefault();
      store.setActiveId(store.first());
    }
  }

  return (
    <Portal>
      <ComboboxPopover
        className={cn(
          'z-500 max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-popover shadow-md',
          className
        )}
        onKeyDownCapture={handleKeyDown}
        {...props}
      />
    </Portal>
  );
};

const comboboxItemVariants = cva(
  'relative mx-1 flex h-[28px] select-none items-center rounded-sm px-2 text-foreground text-sm outline-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: '',
        true: 'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground',
      },
    },
  }
);

const InlineComboboxItem = ({
  className,
  focusEditor = true,
  group,
  keywords,
  label,
  onClick,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'value'> & {
  focusEditor?: boolean;
  group?: string;
  keywords?: string[];
  label?: string;
  value: string;
}) => {
  const { value } = props;

  const { filter, removeInput } = useInlineComboboxContext();

  const store = useComboboxContext()!;

  // Optimization: Do not subscribe to value if filter is false
  const search = filter && store.useState('value');

  const visible = React.useMemo(
    () =>
      !filter || filter({ group, keywords, label, value }, search as string),
    [filter, group, keywords, label, value, search]
  );

  if (!visible) return null;

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        removeInput(focusEditor);
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
  const store = useComboboxContext()!;
  const items = store.useState('items');

  React.useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div
      className={cn(comboboxItemVariants({ interactive: false }), className)}
    >
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
        'hidden not-last:border-b py-1.5 [&:has([role=option])]:block',
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
  InlineComboboxInput,
  InlineComboboxItem,
};
