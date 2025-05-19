'use client';

import * as React from 'react';

import {
  indentListItems,
  unindentListItems,
} from '@udecode/plate-list-classic';
import {
  BulletedListPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list-classic/react';
import { useEditorRef } from '@udecode/plate/react';
import { IndentIcon, List, ListOrdered, OutdentIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function ListToolbarButton({
  nodeType = BulletedListPlugin.key,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  nodeType?: string;
}) {
  const state = useListToolbarButtonState({ nodeType });
  const { props: buttonProps } = useListToolbarButton(state);

  return (
    <ToolbarButton
      {...props}
      {...buttonProps}
      tooltip={
        nodeType === BulletedListPlugin.key ? 'Bulleted List' : 'Numbered List'
      }
    >
      {nodeType === BulletedListPlugin.key ? <List /> : <ListOrdered />}
    </ToolbarButton>
  );
}

export function IndentToolbarButton({
  reverse = false,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & {
  reverse?: boolean;
}) {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        reverse ? unindentListItems(editor) : indentListItems(editor);
      }}
      tooltip={reverse ? 'Outdent' : 'Indent'}
    >
      {reverse ? <OutdentIcon /> : <IndentIcon />}
    </ToolbarButton>
  );
}
