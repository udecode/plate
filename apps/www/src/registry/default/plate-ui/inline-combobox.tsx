import React, {
  createContext,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  Combobox,
  ComboboxItem,
  ComboboxItemProps,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
} from '@ariakit/react';
import { cn } from '@udecode/cn';
import {
  filterWords,
  useComboboxInput,
  UseComboboxInputResult,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox';
import {
  insertText,
  moveSelection,
  useComposedRef,
  useEditorRef,
} from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

type FilterFn = (
  item: { value: string; keywords?: string[] },
  search: string
) => boolean;

interface InlineComboboxContextValue {
  trigger: string;
  showTrigger: boolean;
  filter: FilterFn | false;
  value: string;
  inputRef: RefObject<HTMLInputElement>;
  inputProps: UseComboboxInputResult['props'];
  removeInput: UseComboboxInputResult['removeInput'];
  visibleCount: number;
  dispatchVisible: (action: 'increment' | 'decrement') => void;
  setHasEmpty: (hasEmpty: boolean) => void;
}

const InlineComboboxContext = createContext<InlineComboboxContextValue>(
  null as any
);

const defaultFilter: FilterFn = ({ value, keywords = [] }, search) =>
  [value, ...keywords].some((keyword) => filterWords(keyword, search));

interface InlineComboboxProps {
  value?: string;
  setValue?: (value: string) => void;
  trigger: string;
  showTrigger?: boolean;
  filter?: FilterFn | false;
  children: ReactNode;
}

const InlineCombobox = ({
  value: valueProp,
  setValue: setValueProp,
  trigger,
  showTrigger = true,
  filter = defaultFilter,
  children,
}: InlineComboboxProps) => {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const [valueState, setValueState] = useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;
  const setValue = hasValueProp ? setValueProp ?? (() => {}) : setValueState;

  const { removeInput, props: inputProps } = useComboboxInput({
    ref: inputRef,
    cursorState,
    cancelInputOnBlur: false,
    onCancelInput: (cause) => {
      if (cause !== 'backspace') {
        insertText(editor, trigger + value);
      }

      if (cause === 'arrowLeft' || cause === 'arrowRight') {
        moveSelection(editor, {
          distance: 1,
          reverse: cause === 'arrowLeft',
        });
      }
    },
  });

  const [visibleCount, dispatchVisible] = useReducer(
    (state: number, action: 'increment' | 'decrement') =>
      state + (action === 'increment' ? 1 : -1),
    0
  );

  const [hasEmpty, setHasEmpty] = useState(false);

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      trigger,
      showTrigger,
      filter,
      value,
      inputRef,
      inputProps,
      removeInput,
      visibleCount,
      dispatchVisible,
      setHasEmpty,
    }),
    [
      trigger,
      showTrigger,
      filter,
      value,
      inputRef,
      inputProps,
      removeInput,
      visibleCount,
      setHasEmpty,
    ]
  );

  return (
    <span contentEditable={false}>
      <ComboboxProvider
        open={visibleCount > 0 || hasEmpty}
        setValue={(newValue) => startTransition(() => setValue(newValue))}
      >
        <InlineComboboxContext.Provider value={contextValue}>
          {children}
        </InlineComboboxContext.Provider>
      </ComboboxProvider>
    </span>
  );
};

const InlineComboboxInput = forwardRef<
  HTMLInputElement,
  HTMLAttributes<HTMLInputElement>
>(({ className, ...props }, propRef) => {
  const {
    inputRef: contextRef,
    inputProps,
    value,
    trigger,
    showTrigger,
  } = useContext(InlineComboboxContext);

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
          aria-hidden="true"
          className="invisible overflow-hidden text-nowrap"
        >
          {value || '\u200B'}
        </span>

        <Combobox
          ref={ref}
          autoSelect
          value={value}
          className={cn(
            'absolute left-0 top-0 size-full bg-transparent outline-none',
            className
          )}
          {...inputProps}
          {...props}
        />
      </span>
    </>
  );
});

InlineComboboxInput.displayName = 'InlineComboboxInput';

const InlineComboboxContent: typeof ComboboxPopover = ({
  className,
  ...props
}) => {
  // Portal prevents CSS from leaking into popover
  return (
    <Portal>
      <ComboboxPopover
        className={cn(
          'z-[500] max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-popover shadow-md',
          className
        )}
        {...props}
      />
    </Portal>
  );
};

const comboboxItemVariants = cva(
  'relative flex h-9 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground',
        false: '',
      },
    },
    defaultVariants: {
      interactive: true,
    },
  }
);

export type InlineComboboxItemProps = ComboboxItemProps &
  Required<Pick<ComboboxItemProps, 'value'>> & {
    keywords?: string[];
  };

const InlineComboboxItem = ({
  className,
  onClick,
  keywords,
  ...props
}: InlineComboboxItemProps) => {
  const { value } = props;

  const {
    value: search,
    filter,
    dispatchVisible,
    removeInput,
  } = useContext(InlineComboboxContext);

  const visible = useMemo(
    () => !filter || filter({ value, keywords }, search),
    [filter, value, keywords, search]
  );

  const previousVisibleRef = useRef(false);

  useEffect(() => {
    if (visible !== previousVisibleRef.current) {
      dispatchVisible(visible ? 'increment' : 'decrement');
    }

    previousVisibleRef.current = visible;
  }, [dispatchVisible, visible]);

  if (!visible) return null;

  return (
    <ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        removeInput(true);
        onClick?.(event);
      }}
      {...props}
    />
  );
};

const InlineComboboxEmpty = ({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) => {
  const { visibleCount, setHasEmpty } = useContext(InlineComboboxContext);

  useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (visibleCount > 0) return null;

  return (
    <div
      className={cn(comboboxItemVariants({ interactive: false }), className)}
    >
      {children}
    </div>
  );
};

export {
  InlineCombobox,
  InlineComboboxInput,
  InlineComboboxContent,
  InlineComboboxItem,
  InlineComboboxEmpty,
};
