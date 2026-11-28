'use client';

import { List, ListOrdered, ListTodoIcon } from 'lucide-react';
import { ListStyle, ListType } from 'platejs';
import {
  type Editor,
  ListPlugin,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  ToolbarButton,
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from '@/registry/components/editor/toolbar';

const readSharedListStyle = (editor: Editor, type: ListType) => {
  if (!editor.read.selection()) return '';

  const styles = new Set(
    editor.read.nodes.blocks({ mode: 'lowest' }).map(([node]) => {
      if (node.listType !== type) return '';
      if (typeof node.listStyle === 'string') return node.listStyle;

      return type === ListType.Numbered ? ListStyle.Decimal : ListStyle.Disc;
    })
  );
  const [style = ''] = styles;

  return styles.size === 1 ? style : '';
};

const setListStyle = (editor: Editor, type: ListType, listStyle: string) => {
  if (readSharedListStyle(editor, type) === listStyle) return;

  editor.plugin(ListPlugin).update.toggle({ listStyle, type });
};

export function BulletedListToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);

  const pressed = useEditorSelector((current) =>
    current.plugin(ListPlugin).read.isActive({ type: ListType.Bulleted })
  );
  const activeStyle = useEditorSelector((current) =>
    readSharedListStyle(current, ListType.Bulleted)
  );

  return (
    <ToolbarSplitButton pressed={open}>
      <ToolbarSplitButtonPrimary
        aria-label="Bulleted list"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        disabled={readOnly}
        onClick={() => {
          editor.plugin(ListPlugin).update.toggle({
            type: ListType.Bulleted,
          });
          editor.api.dom.focus();
        }}
        data-state={pressed ? 'on' : 'off'}
      >
        <List className="size-4 [&:dir(rtl)]:-scale-x-100" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger disabled={readOnly}>
          <ToolbarSplitButtonSecondary aria-label="Bulleted list styles" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          onFinalFocus={(event) => {
            event.preventDefault();
            editor.api.dom.focus();
          }}
          align="start"
          alignOffset={-32}
        >
          <DropdownMenuRadioGroup
            value={activeStyle}
            onValueChange={(value) => {
              setListStyle(editor, ListType.Bulleted, value);
            }}
          >
            <DropdownMenuRadioItem value={ListStyle.Disc}>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current bg-current" />
                Default
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.Circle}>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current" />
                Circle
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.Square}>
              <div className="flex items-center gap-2">
                <div className="size-2 border border-current bg-current" />
                Square
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function NumberedListToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState('');
  const startId = React.useId();

  const pressed = useEditorSelector((current) =>
    current.plugin(ListPlugin).read.isActive({ type: ListType.Numbered })
  );
  const activeStyle = useEditorSelector((current) =>
    readSharedListStyle(current, ListType.Numbered)
  );
  const numberingDisabled = !pressed || readOnly;

  return (
    <ToolbarSplitButton pressed={open}>
      <ToolbarSplitButtonPrimary
        aria-label="Numbered list"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        disabled={readOnly}
        onClick={() => {
          editor.plugin(ListPlugin).update.toggle({
            type: ListType.Numbered,
          });
          editor.api.dom.focus();
        }}
        data-state={pressed ? 'on' : 'off'}
      >
        <ListOrdered className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setStart('');
        }}
        modal={false}
      >
        <DropdownMenuTrigger disabled={readOnly}>
          <ToolbarSplitButtonSecondary aria-label="Numbered list styles" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          onFinalFocus={(event) => {
            event.preventDefault();
            editor.api.dom.focus();
          }}
          align="start"
          alignOffset={-32}
        >
          <DropdownMenuRadioGroup
            value={activeStyle}
            onValueChange={(value) => {
              setListStyle(editor, ListType.Numbered, value);
            }}
          >
            <DropdownMenuRadioItem value={ListStyle.Decimal}>
              Decimal (1, 2, 3)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.DecimalLeadingZero}>
              Decimal Leading Zero (01, 02, 03)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.LowerAlpha}>
              Lower Alpha (a, b, c)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.UpperAlpha}>
              Upper Alpha (A, B, C)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.LowerRoman}>
              Lower Roman (i, ii, iii)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ListStyle.UpperRoman}>
              Upper Roman (I, II, III)
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={numberingDisabled}
              onSelect={() => {
                editor.plugin(ListPlugin).update.restart();
              }}
            >
              Restart numbering
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={numberingDisabled}
              onSelect={() => {
                editor.plugin(ListPlugin).update.continue();
              }}
            >
              Continue numbering
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <form
            className="flex items-center gap-2 px-2 py-1.5 text-sm"
            onSubmit={(event) => {
              event.preventDefault();

              const value = Number(start);

              if (
                numberingDisabled ||
                start.trim() === '' ||
                !Number.isSafeInteger(value)
              ) {
                return;
              }

              editor.plugin(ListPlugin).update.restart({ start: value });
              setOpen(false);
            }}
          >
            <label htmlFor={startId}>Start at</label>
            <Input
              id={startId}
              className="h-7 w-16"
              disabled={numberingDisabled}
              inputMode="numeric"
              placeholder="1"
              step={1}
              type="number"
              value={start}
              onChange={(event) => {
                setStart(event.target.value);
              }}
              // The menu reads typed characters and arrows as item navigation.
              onKeyDown={(event) => {
                if (event.key !== 'Escape') event.stopPropagation();
              }}
            />
            <Button
              disabled={numberingDisabled}
              size="xs"
              type="submit"
              variant="secondary"
            >
              Apply
            </Button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function TodoListToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const pressed = useEditorSelector((current) =>
    current.plugin(ListPlugin).read.isActive({ type: ListType.Task })
  );

  return (
    <ToolbarButton
      {...props}
      disabled={props.disabled || readOnly}
      pressed={pressed}
      onClick={() => {
        editor.plugin(ListPlugin).update.toggle({ type: ListType.Task });
        editor.api.dom.focus();
      }}
      tooltip="Todo"
    >
      <ListTodoIcon />
    </ToolbarButton>
  );
}
