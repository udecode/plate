import React, {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  createContext,
  forwardRef,
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
  type ComboboxItemProps,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
} from '@ariakit/react';
import { cn } from '@udecode/cn';
import {
  type UseComboboxInputResult,
  filterWords,
  useComboboxInput,
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
  item: { keywords?: string[]; value: string },
  search: string
) => boolean;

interface InlineComboboxContextValue {
  dispatchVisible: (action: 'decrement' | 'increment') => void;
  filter: FilterFn | false;
  inputProps: UseComboboxInputResult['props'];
  inputRef: RefObject<HTMLInputElement>;
  removeInput: UseComboboxInputResult['removeInput'];
  setHasEmpty: (hasEmpty: boolean) => void;
  showTrigger: boolean;
  trigger: string;
  value: string;
  visibleCount: number;
}

const InlineComboboxContext = createContext<InlineComboboxContextValue>(
  null as any
);

const defaultFilter: FilterFn = ({ keywords = [], value }, search) =>
  [value, ...keywords].some((keyword) => filterWords(keyword, search));

interface InlineComboboxProps {
  children: ReactNode;
  trigger: string;
  filter?: FilterFn | false;
  setValue?: (value: string) => void;
  showTrigger?: boolean;
  value?: string;
}

const InlineCombobox = ({
  children,
  filter = defaultFilter,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const [valueState, setValueState] = useState('');
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;
  const setValue = hasValueProp ? setValueProp ?? (() => {}) : setValueState;

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: false,
    cursorState,
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
    ref: inputRef,
  });

  const [visibleCount, dispatchVisible] = useReducer(
    (state: number, action: 'decrement' | 'increment') =>
      state + (action === 'increment' ? 1 : -1),
    0
  );

  const [hasEmpty, setHasEmpty] = useState(false);

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      dispatchVisible,
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
      value,
      visibleCount,
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
    inputProps,
    inputRef: contextRef,
    showTrigger,
    trigger,
    value,
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
          autoSelect
          className={cn(
            'absolute left-0 top-0 size-full bg-transparent outline-none',
            className
          )}
          ref={ref}
          value={value}
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

export type InlineComboboxItemProps = {
  keywords?: string[];
} & ComboboxItemProps &
  Required<Pick<ComboboxItemProps, 'value'>>;

const InlineComboboxItem = ({
  className,
  keywords,
  onClick,
  ...props
}: InlineComboboxItemProps) => {
  const { value } = props;

  const {
    dispatchVisible,
    filter,
    removeInput,
    value: search,
  } = useContext(InlineComboboxContext);

  const visible = useMemo(
    () => !filter || filter({ keywords, value }, search),
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
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty, visibleCount } = useContext(InlineComboboxContext);

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
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
};
