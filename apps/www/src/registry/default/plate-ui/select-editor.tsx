'use client';

import React from 'react';

import { useCommandActions } from '@udecode/cmdk';
import {
  getEditorString,
  isHotkey,
  moveSelection,
  removeEditorText,
  replaceNodeChildren,
  someNode,
} from '@udecode/plate-common';
import {
  Plate,
  useEditorContainerRef,
  useEditorRef,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { isEqualTags } from '@udecode/plate-tag';
import {
  TagPlugin,
  useSelectEditorCombobox,
  useSelectableItems,
} from '@udecode/plate-tag/react';
import { Fzf } from 'fzf';
import { PlusIcon } from 'lucide-react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/registry/default/plate-ui/command';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/registry/default/plate-ui/popover';
import { TagElement } from '@/registry/default/plate-ui/tag-element';

export type SelectItem = {
  value: string;
  isNew?: boolean;
};

type SelectEditorContextValue = {
  items: SelectItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValue?: SelectItem[];
  value?: SelectItem[];
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
  const [internalValue] = React.useState(defaultValue);

  return (
    <SelectEditorContext.Provider
      value={{
        items,
        open,
        setOpen,
        value: value ?? internalValue,
        onValueChange,
      }}
    >
      <Command variant="combobox" shouldFilter={false} loop>
        {children}
      </Command>
    </SelectEditorContext.Provider>
  );
}

export function SelectEditorContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { value } = useSelectEditorContext();
  const { setSearch } = useCommandActions();

  const editor = usePlateEditor(
    {
      plugins: [
        TagPlugin.configure({
          node: {
            component: TagElement,
          },
        }),
      ],
      value: createEditorValue(value),
    },
    []
  );

  React.useEffect(() => {
    if (!isEqualTags(editor, value)) {
      replaceNodeChildren(editor, {
        at: [],
        nodes: createEditorValue(value),
      });
    }
  }, [editor, value]);

  return (
    <Plate
      onValueChange={({ editor }) => {
        setSearch(getEditorString(editor, []));
      }}
      editor={editor}
    >
      <EditorContainer variant="select">{children}</EditorContainer>
    </Plate>
  );
}

export const SelectEditorInput = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Editor>
>((props, ref) => {
  const editor = useEditorRef();
  const { setOpen } = useSelectEditorContext();
  const { selectCurrentItem, selectFirstItem } = useCommandActions();

  return (
    <Editor
      ref={ref}
      variant="select"
      onBlur={() => setOpen(false)}
      onFocusCapture={() => {
        setOpen(true);
        selectFirstItem();
      }}
      onKeyDown={(e) => {
        if (isHotkey('enter', e)) {
          e.preventDefault();
          selectCurrentItem();
          removeEditorText(editor);

          if (someNode(editor, { match: { type: TagPlugin.key } })) {
            moveSelection(editor);
          }
        }
        if (isHotkey('escape', e) || isHotkey('mod+enter', e)) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      autoFocusOnEditable
      {...props}
    />
  );
});

export function SelectEditorCombobox() {
  const editor = useEditorRef();
  const containerRef = useEditorContainerRef();
  const { items, open, onValueChange } = useSelectEditorContext();
  const selectableItems = useSelectableItems({
    filter: fzfFilter,
    items,
  });
  const { selectFirstItem } = useCommandActions();

  useSelectEditorCombobox({ open, selectFirstItem, onValueChange });

  if (!open || selectableItems.length === 0) return null;

  return (
    <Popover open={open}>
      <PopoverAnchor virtualRef={containerRef} />
      <PopoverContent
        className="p-0"
        style={{
          width: (containerRef.current?.offsetWidth ?? 0) + 8,
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
        alignOffset={-4}
        animate={false}
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
                  editor.getTransforms(TagPlugin).insert.option(item);
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
          type: TagPlugin.key,
          ...item,
        },
        {
          text: '',
        },
      ]) ?? []),
    ],
    type: 'p',
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
