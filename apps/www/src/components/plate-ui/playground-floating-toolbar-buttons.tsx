import React from 'react';
import { isEnabled } from '@/plate/demo/is-enabled';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { usePlateReadOnly } from '@udecode/plate-common';

import { ValueId } from '@/config/setting-values';
import { Icons } from '@/components/icons';
import { CommentToolbarButton } from '@/registry/default/plate-ui/comment-toolbar-button';
import { LinkToolbarButton } from '@/registry/default/plate-ui/link-toolbar-button';
import { MarkToolbarButton } from '@/registry/default/plate-ui/mark-toolbar-button';
import { ToolbarSeparator } from '@/registry/default/plate-ui/toolbar';

import { PlaygroundMoreDropdownMenu } from './playground-more-dropdown-menu';
import { PlaygroundTurnIntoDropdownMenu } from './playground-turn-into-dropdown-menu';

export function PlaygroundFloatingToolbarButtons({ id }: { id?: ValueId }) {
  const readOnly = usePlateReadOnly();

  return (
    <div className="print:hidden">
      {!readOnly && (
        <>
          <PlaygroundTurnIntoDropdownMenu />

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

          {isEnabled('link', id) && <LinkToolbarButton />}
        </>
      )}

      {isEnabled('comment', id) && <CommentToolbarButton />}

      <PlaygroundMoreDropdownMenu />
    </div>
  );
}
