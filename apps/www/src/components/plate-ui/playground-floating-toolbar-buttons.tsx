import React from 'react';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { CommentsPlugin } from '@udecode/plate-comments';
import { useEditorReadOnly } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link';

import { CheckPlugin } from '@/components/context/check-plugin';
import { Icons } from '@/components/icons';
import { CommentToolbarButton } from '@/registry/default/plate-ui/comment-toolbar-button';
import { LinkToolbarButton } from '@/registry/default/plate-ui/link-toolbar-button';
import { MarkToolbarButton } from '@/registry/default/plate-ui/mark-toolbar-button';
import { ToolbarSeparator } from '@/registry/default/plate-ui/toolbar';

import { PlaygroundMoreDropdownMenu } from './playground-more-dropdown-menu';
import { PlaygroundTurnIntoDropdownMenu } from './playground-turn-into-dropdown-menu';

export function PlaygroundFloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <PlaygroundTurnIntoDropdownMenu />

          <CheckPlugin plugin={BoldPlugin}>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <Icons.bold />
            </MarkToolbarButton>
          </CheckPlugin>

          <CheckPlugin plugin={ItalicPlugin}>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <Icons.italic />
            </MarkToolbarButton>
          </CheckPlugin>

          <CheckPlugin plugin={UnderlinePlugin}>
            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <Icons.underline />
            </MarkToolbarButton>
          </CheckPlugin>

          <CheckPlugin plugin={StrikethroughPlugin}>
            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <Icons.strikethrough />
            </MarkToolbarButton>
          </CheckPlugin>

          <CheckPlugin plugin={CodePlugin}>
            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Icons.code />
            </MarkToolbarButton>
          </CheckPlugin>

          <ToolbarSeparator />

          <CheckPlugin id="link" plugin={LinkPlugin}>
            <LinkToolbarButton />
          </CheckPlugin>
        </>
      )}

      <CheckPlugin id="comment" plugin={CommentsPlugin}>
        <CommentToolbarButton />
      </CheckPlugin>

      {!readOnly && <PlaygroundMoreDropdownMenu />}
    </>
  );
}
