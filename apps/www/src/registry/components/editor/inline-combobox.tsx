'use client';

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
  useStoreState,
} from '@ariakit/react';
import { cva } from 'class-variance-authority';
import {
  Hotkeys,
  isHotkey,
  type PlatePluginTransaction,
  type Element,
} from 'platejs';
import { BaseComboboxPlugin, filterWords } from 'platejs/combobox';
import { useComposedRef, useEditor, useElementSelected } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string
) => boolean;

type InlineComboboxContextValue = {
  autoFocus: boolean;
  filter: FilterFn | false;
  inputProps: Required<
    Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onKeyDown'>
  >;
  inputRef: React.RefObject<HTMLInputElement | null>;
  commit: (
    callback: (tx: PlatePluginTransaction) => void,
    focusEditor?: boolean
  ) => boolean;
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

const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: {
  children: React.ReactNode;
  element: Element;
  trigger: string;
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
  showTrigger?: boolean;
  value?: string;
  setValue?: (value: string) => void;
}) => {
  const editor = useEditor();
  const combobox = editor.plugin(BaseComboboxPlugin);
  const inputKey = React.useMemo(() => editor.key(element), [editor, element]);
  const selected = useElementSelected();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [valueState, setValueState] = React.useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  const canEdit = combobox.read.canEdit(inputKey);

  const commit = React.useCallback(
    (callback: (tx: PlatePluginTransaction) => void, focusEditor = false) => {
      const completed = combobox.api.commit(inputKey, callback);

      if (completed && focusEditor) editor.api.dom.focus();

      return completed;
    },
    [combobox, editor, inputKey]
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
      const completed = combobox.api.cancel(inputKey, {
        text:
          cause === 'backspace'
            ? ''
            : trigger + (inputRef.current?.value ?? value),
        select:
          cause === 'arrowLeft' ? 'start' : focusEditor ? 'end' : undefined,
      });

      if (completed && focusEditor) editor.api.dom.focus();
    },
    [combobox, editor, inputKey, trigger, value]
  );

  const previousSelected = React.useRef(selected);

  React.useEffect(() => {
    if (previousSelected.current && !selected) cancelInput('deselect');

    previousSelected.current = selected;
  }, [cancelInput, selected]);

  const inputProps = React.useMemo<InlineComboboxContextValue['inputProps']>(
    () => ({
      onBlur: () => {
        cancelInput('blur');
      },
      onKeyDown: (event) => {
        // oxlint-disable-next-line typescript/no-deprecated -- Safari can clear isComposing before the final IME key event.
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;

        const {
          selectionEnd,
          selectionStart,
          value: inputValue,
        } = event.currentTarget;
        const cursorCollapsed = selectionStart === selectionEnd;
        const cursorAtStart = cursorCollapsed && selectionStart === 0;
        const cursorAtEnd =
          cursorCollapsed && selectionEnd === inputValue.length;
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

        const handled = Hotkeys.isUndo(event)
          ? combobox.api.undo(inputKey)
          : Hotkeys.isRedo(event)
            ? combobox.api.redo(inputKey)
            : false;

        if (handled) {
          event.preventDefault();
          event.stopPropagation();
          editor.api.dom.focus();
        }
      },
    }),
    [cancelInput, combobox, editor, inputKey]
  );

  const [hasEmpty, setHasEmpty] = React.useState(false);

  const contextValue = React.useMemo<InlineComboboxContextValue>(
    () => ({
      autoFocus: canEdit,
      commit,
      filter,
      inputProps,
      inputRef,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [canEdit, commit, filter, inputProps, showTrigger, trigger]
  );

  const store = useComboboxStore({
    setValue: (newValue) => {
      React.startTransition(() => {
        setValueProp?.(newValue);
        if (!hasValueProp) setValueState(newValue);
      });
    },
  });

  const items = useStoreState(store, 'items');

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
          canEdit &&
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

function InlineComboboxInput({
  className,
  ref: propRef,
  ...props
}: React.HTMLAttributes<HTMLInputElement> & {
  ref?: React.RefObject<HTMLInputElement | null>;
}) {
  const {
    autoFocus,
    inputProps,
    inputRef: contextRef,
    showTrigger,
    trigger,
  } = useInlineComboboxContext();

  const store = useComboboxContext();

  if (store == null) {
    throw new Error('InlineComboboxInput requires a Combobox store');
  }

  const value = useStoreState(store, 'value');

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
          autoFocus={autoFocus}
          disabled={!autoFocus}
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
}

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
          'cn-command cn-command-list z-500 w-[300px] overflow-x-hidden overflow-y-auto shadow-md',
          className
        )}
        onKeyDownCapture={handleKeyDown}
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
  onSelect?: (tx: PlatePluginTransaction) => void;
}) => {
  const { value } = props;

  const { commit, filter } = useInlineComboboxContext();

  const store = useComboboxContext();

  if (store == null) {
    throw new Error('InlineComboboxItem requires a Combobox store');
  }

  const search = useStoreState(store, 'value');

  const visible = React.useMemo(
    () => !filter || filter({ group, keywords, label, value }, search),
    [filter, group, keywords, label, value, search]
  );

  if (!visible) return null;

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        if (commit((tx) => onSelect?.(tx), focusEditor)) onClick?.(event);
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
  InlineComboboxInput,
  InlineComboboxItem,
};
