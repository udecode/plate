'use client';

import * as React from 'react';

import { MultiSelectPlugin } from '@platejs/tag/react';
import { Command as CommandPrimitive, useCommandActions } from '@udecode/cmdk';
import { Fzf } from 'fzf';
import { PlusIcon } from 'lucide-react';
import { isHotkey, TextApi } from 'platejs';
import {
  Plate,
  useEditor,
  useEditorSelector,
  usePlateEditor,
  usePlateValue,
} from 'platejs/react';

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Editor, EditorContainer } from './editor';
import { TagElement } from './tag';

export type SelectItem = {
  value: string;
  isNew?: boolean;
};

const areSelectItemsEqual = (
  previous: SelectItem[] | null | undefined,
  next: SelectItem[] | undefined
) =>
  (previous?.length ?? 0) === (next?.length ?? 0) &&
  (previous ?? []).every((item, index) => item.value === next?.[index]?.value);
const EMPTY_SELECT_ITEMS: SelectItem[] = [];

type SelectEditorContextValue = {
  controlled: boolean;
  hasSelectableItemsRef: React.RefObject<boolean>;
  items: SelectItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValue?: SelectItem[];
  value?: SelectItem[];
  setValue: (items: SelectItem[]) => void;
  onValueChange?: (items: SelectItem[]) => void;
};

const SelectEditorContext = React.createContext<
  SelectEditorContextValue | undefined
>(undefined);

const useSelectEditorContext = () => {
  const context = React.useContext(SelectEditorContext);

  if (!context) {
    throw new Error('useSelectEditor must be used within SelectEditor');
  }

  return context;
};

export function SelectEditor({
  children,
  defaultValue,
  items = [],
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  defaultValue?: SelectItem[];
  items?: SelectItem[];
  value?: SelectItem[];
  onValueChange?: (items: SelectItem[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const hasSelectableItemsRef = React.useRef(false);

  return (
    <SelectEditorContext
      value={{
        controlled: value !== undefined,
        hasSelectableItemsRef,
        items,
        open,
        setOpen,
        setValue: setInternalValue,
        value: value ?? internalValue,
        onValueChange,
      }}
    >
      <Command
        className="overflow-visible bg-transparent has-data-readonly:w-fit"
        shouldFilter={false}
        loop
      >
        {children}
      </Command>
    </SelectEditorContext>
  );
}

export function SelectEditorContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { controlled, value } = useSelectEditorContext();
  const { setSearch } = useCommandActions();

  const editor = usePlateEditor(
    {
      plugins: [MultiSelectPlugin.configure({ component: TagElement })],
      initialValue: createEditorValue(value),
    },
    []
  );

  return (
    <Plate
      onValueChange={({ editor }) => {
        setSearch(editor.read.text.string([]));
      }}
      editor={editor}
    >
      <SelectEditorValueSync controlled={controlled} value={value} />
      <EditorContainer variant="select">{children}</EditorContainer>
    </Plate>
  );
}

function SelectEditorValueSync({
  controlled,
  value,
}: {
  controlled: boolean;
  value?: SelectItem[];
}) {
  const editor = useEditor();
  const selectedItems = useEditorSelector(
    (editor) => editor.plugin(MultiSelectPlugin).read.getSelectedItems(),
    {
      equalityFn: (previous, next) =>
        !!previous &&
        previous.length === next.length &&
        previous.every((item, index) => item.value === next[index]?.value),
    }
  );
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (!controlled || editor.plugin(MultiSelectPlugin).read.isEqual(value)) {
      return;
    }
    const timeout = globalThis.setTimeout(() => {
      const currentValue = valueRef.current;

      if (!editor.plugin(MultiSelectPlugin).read.isEqual(currentValue)) {
        editor.update({ history: 'skip' }).value.replace({
          children: createEditorValue(currentValue),
        });
      }
    });

    return () => globalThis.clearTimeout(timeout);
  }, [controlled, editor, selectedItems, value]);

  return null;
}

export const SelectEditorInput = ({
  ref,
  onBlur,
  onFocusCapture,
  onKeyDown,
  ...editorProps
}: React.ComponentPropsWithoutRef<typeof Editor> & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => {
  const editor = useEditor();
  const { hasSelectableItemsRef, setOpen } = useSelectEditorContext();
  const { selectCurrentItem, selectFirstItem } = useCommandActions();

  return (
    <Editor
      ref={ref}
      variant="select"
      autoFocusOnEditable
      {...editorProps}
      onBlur={(event) => {
        setOpen(false);
        onBlur?.(event);
      }}
      onFocusCapture={(event) => {
        setOpen(true);
        selectFirstItem();
        onFocusCapture?.(event);
      }}
      onKeyDown={(e) => {
        if (isHotkey('mod+z', e)) {
          e.preventDefault();
          return true;
        }
        if (isHotkey('enter', e)) {
          e.preventDefault();
          if (hasSelectableItemsRef.current) {
            selectCurrentItem();
            editor.update({ history: 'skip' }).nodes.remove({
              at: [],
              match: (node) => TextApi.isText(node) && node.text.length > 0,
            });
          }
          return true;
        }
        if (isHotkey('escape', e) || isHotkey('mod+enter', e)) {
          e.preventDefault();
          e.currentTarget.blur();
          return true;
        }

        return onKeyDown?.(e);
      }}
    />
  );
};

export function SelectEditorCombobox() {
  const editor = useEditor();
  const containerRef = usePlateValue('containerRef');
  const {
    controlled,
    hasSelectableItemsRef,
    items,
    open,
    onValueChange,
    setValue,
    value,
  } = useSelectEditorContext();
  const { selectFirstItem } = useCommandActions();
  const onValueChangeRef = React.useRef(onValueChange);
  const previousValueRef = React.useRef(value);
  const selectedItems =
    useEditorSelector(
      (editor) => editor.plugin(MultiSelectPlugin).read.getSelectedItems(),
      {
        equalityFn: areSelectItemsEqual,
      }
    ) ?? EMPTY_SELECT_ITEMS;
  const search = useEditorSelector((editor) => editor.read.text.string([]));
  const selectableItems = React.useMemo(() => {
    const seenValues = new Set<string>();
    const uniqueItems = items.filter((item) => {
      const value = item.value.toLowerCase();

      if (seenValues.has(value)) return false;

      seenValues.add(value);

      return true;
    });
    const trimmedSearch = search.trim().replaceAll(/\s+/g, ' ');
    const newItems: SelectItem[] =
      trimmedSearch.length >= 2 &&
      !uniqueItems.some(
        (item) => item.value.toLowerCase() === trimmedSearch.toLowerCase()
      )
        ? [{ isNew: true, value: trimmedSearch }]
        : [];
    const availableItems = [...uniqueItems, ...newItems].filter(
      (item) =>
        !selectedItems.some(
          (selected) =>
            selected.value.toLowerCase() === item.value.toLowerCase()
        )
    );

    return trimmedSearch
      ? availableItems.filter((item) => fzfFilter(item.value, trimmedSearch))
      : availableItems;
  }, [items, search, selectedItems]);

  React.useLayoutEffect(() => {
    hasSelectableItemsRef.current = open && selectableItems.length > 0;

    return () => {
      hasSelectableItemsRef.current = false;
    };
  }, [hasSelectableItemsRef, open, selectableItems.length]);

  React.useEffect(() => {
    if (!open) {
      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.remove({
          at: [],
          match: (node) => TextApi.isText(node) && node.text.length > 0,
        });

        const end = tx.points.end([]);

        if (end) tx.selection.set(end);
      });
    }
  }, [editor, open]);

  React.useEffect(() => {
    selectFirstItem();
  }, [search, selectFirstItem]);

  React.useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  React.useEffect(() => {
    const valueChanged = !areSelectItemsEqual(previousValueRef.current, value);

    previousValueRef.current = value;
    if (valueChanged || areSelectItemsEqual(selectedItems, value)) return;

    if (!controlled) setValue([...selectedItems]);
    onValueChangeRef.current?.(selectedItems);
  }, [controlled, selectedItems, setValue, value]);
  const virtualAnchor = React.useMemo(
    () => ({
      getBoundingClientRect: () =>
        containerRef.current?.getBoundingClientRect() ?? new DOMRect(),
    }),
    [containerRef]
  );

  if (!open || selectableItems.length === 0) return null;

  return (
    <Popover open={open}>
      <PopoverAnchor virtualRef={{ current: virtualAnchor }} />
      <PopoverContent
        className="p-0 data-[state=open]:animate-none"
        style={{
          // eslint-disable-next-line react-hooks/refs -- Reading ref for dynamic width calculation
          width: (containerRef.current?.offsetWidth ?? 0) + 8,
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
        alignOffset={-4}
        sideOffset={8}
      >
        <CommandList>
          <CommandGroup>
            {selectableItems.map((item) => (
              <CommandItem
                key={item.value}
                className="cursor-pointer gap-2"
                onMouseDown={(e) => e.preventDefault()}
                onSelect={() => {
                  editor
                    .plugin(MultiSelectPlugin)
                    .update({ history: 'skip' })
                    .insert(item);
                  editor.update({ history: 'skip' }, (tx) => {
                    tx.nodes.remove({
                      at: [],
                      match: (node) =>
                        TextApi.isText(node) && node.text.length > 0,
                    });

                    const end = tx.points.end([]);

                    if (end) tx.selection.set(end);
                  });
                }}
              >
                {item.isNew ? (
                  <div className="flex items-center gap-1">
                    <PlusIcon className="size-4 text-foreground" />
                    Create new label:
                    <span className="text-gray-600">"{item.value}"</span>
                  </div>
                ) : (
                  item.value
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </PopoverContent>
    </Popover>
  );
}

const createEditorValue = (value?: SelectItem[]) => [
  {
    children: [
      { text: '' },
      ...(value?.flatMap((item) => [
        {
          children: [{ text: '' }],
          type: 'tag',
          value: item.value,
        },
        {
          text: '',
        },
      ]) ?? []),
    ],
    type: 'paragraph',
  },
];

const fzfFilter = (value: string, search: string): boolean => {
  if (!search) return true;

  const fzf = new Fzf([value], {
    casing: 'case-insensitive',
    selector: (v: string) => v,
  });

  return fzf.find(search).length > 0;
};

/**
 * You could replace this with import from '@/components/ui/command' + replace
 * 'cmdk' import with '@udecode/cmdk'
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
        className
      )}
      data-slot="command"
      {...props}
    />
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        'max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden',
        className
      )}
      data-slot="command-list"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs',
        className
      )}
      data-slot="command-group"
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="command-item"
      {...props}
    />
  );
}
