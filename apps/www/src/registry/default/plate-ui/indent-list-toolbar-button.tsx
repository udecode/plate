'use client';

import React from 'react';

import { useEditorRef, useEditorSelector } from '@udecode/plate-common/react';
import {
  ListStyleType,
  someIndentList,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { List, ListOrdered } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from './toolbar';

export function NumberedIndentListToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  const pressed = useEditorSelector(
    (editor) =>
      someIndentList(editor, [
        ListStyleType.Decimal,
        ListStyleType.LowerAlpha,
        ListStyleType.UpperAlpha,
        ListStyleType.LowerRoman,
        ListStyleType.UpperRoman,
      ]),
    []
  );

  return (
    <ToolbarSplitButton pressed={openState.open} tooltip="Numbered List">
      <ToolbarSplitButtonPrimary
        onClick={() => {
          toggleIndentList(editor, {
            listStyleType: ListStyleType.Decimal,
          });
        }}
        pressed={pressed}
      >
        <ListOrdered className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu {...openState} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Decimal,
                })
              }
            >
              Decimal (1, 2, 3)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.LowerAlpha,
                })
              }
            >
              Lower Alpha (a, b, c)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.UpperAlpha,
                })
              }
            >
              Upper Alpha (A, B, C)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.LowerRoman,
                })
              }
            >
              Lower Roman (i, ii, iii)
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.UpperRoman,
                })
              }
            >
              Upper Roman (I, II, III)
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function BulletedIndentListToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  const pressed = useEditorSelector(
    (editor) =>
      someIndentList(editor, [
        ListStyleType.Disc,
        ListStyleType.Circle,
        ListStyleType.Square,
      ]),
    []
  );

  return (
    <ToolbarSplitButton pressed={openState.open} tooltip="Bulleted List">
      <ToolbarSplitButtonPrimary
        onClick={() => {
          toggleIndentList(editor, {
            listStyleType: ListStyleType.Disc,
          });
        }}
        pressed={pressed}
      >
        <List className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu {...openState} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Disc,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current bg-current" />
                Default
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Circle,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current" />
                Circle
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Square,
                })
              }
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
