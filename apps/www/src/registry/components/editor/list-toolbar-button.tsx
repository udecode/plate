'use client';

import { ListStyle, ListType } from '@platejs/list';
import { ListPlugin } from '@platejs/list/react';
import { List, ListOrdered, ListTodoIcon } from 'lucide-react';
import { useEditor, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  ToolbarButton,
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from './toolbar';

export function BulletedListToolbarButton() {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  const pressed = useEditorSelector((innerEditor) =>
    innerEditor.plugin(ListPlugin).read.isActive({ type: ListType.Bulleted })
  );

  return (
    <ToolbarSplitButton pressed={open}>
      <ToolbarSplitButtonPrimary
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        onClick={() => {
          editor.plugin(ListPlugin).update.toggle({
            type: ListType.Bulleted,
          });
          editor.api.dom.focus();
        }}
        data-state={pressed ? 'on' : 'off'}
      >
        <List className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                editor.plugin(ListPlugin).update.toggle({
                  type: ListType.Bulleted,
                });
              }}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current bg-current" />
                Default
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.Circle,
                  type: ListType.Bulleted,
                });
              }}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current" />
                Circle
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.Square,
                  type: ListType.Bulleted,
                });
              }}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 border border-current bg-current" />
                Square
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function NumberedListToolbarButton() {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  const pressed = useEditorSelector((innerEditor2) =>
    innerEditor2.plugin(ListPlugin).read.isActive({ type: ListType.Numbered })
  );

  return (
    <ToolbarSplitButton pressed={open}>
      <ToolbarSplitButtonPrimary
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
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

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => {
                editor.plugin(ListPlugin).update.toggle({
                  type: ListType.Numbered,
                });
              }}
            >
              Decimal (1, 2, 3)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.LowerAlpha,
                  type: ListType.Numbered,
                });
              }}
            >
              Lower Alpha (a, b, c)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.UpperAlpha,
                  type: ListType.Numbered,
                });
              }}
            >
              Upper Alpha (A, B, C)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.LowerRoman,
                  type: ListType.Numbered,
                });
              }}
            >
              Lower Roman (i, ii, iii)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                editor.plugin(ListPlugin).update.toggle({
                  listStyle: ListStyle.UpperRoman,
                  type: ListType.Numbered,
                });
              }}
            >
              Upper Roman (I, II, III)
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function TodoListToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditor();
  const pressed = useEditorSelector((innerEditor3) =>
    innerEditor3.plugin(ListPlugin).read.isActive({ type: ListType.Task })
  );

  return (
    <ToolbarButton
      {...props}
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
