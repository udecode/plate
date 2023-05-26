import React from 'react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  usePlateReadOnly,
} from '@udecode/plate';
import { MarkToolbarButton } from './MarkToolbarButton';
import { MoreDropdownMenu } from './MoreDropdownMenu';
import { TurnIntoDropdownMenu } from './TurnIntoDropdownMenu';

import { Icons } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { CommentToolbarButton } from '@/plate/comments/CommentToolbarButton';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';

export function FloatingToolbarButtons() {
  const readOnly = usePlateReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <TurnIntoDropdownMenu />

          <MarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
            <Icons.bold />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
            <Icons.italic />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={MARK_UNDERLINE}
            tooltip="Underline (⌘+U)"
          >
            <Icons.underline />
          </MarkToolbarButton>
          <MarkToolbarButton
            nodeType={MARK_STRIKETHROUGH}
            tooltip="Strikethrough (⌘+⇧+M)"
          >
            <Icons.strikethrough />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_CODE} tooltip="Code (⌘+E)">
            <Icons.code />
          </MarkToolbarButton>

          <ToolbarSeparator />

          <LinkToolbarButton>
            <Icons.link />
          </LinkToolbarButton>
        </>
      )}

      <CommentToolbarButton tooltip="Comment (⌘+⇧+M)">
        <Icons.commentAdd />
      </CommentToolbarButton>

      <MoreDropdownMenu />
    </>
  );
}
