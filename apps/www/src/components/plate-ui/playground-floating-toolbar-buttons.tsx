import React from 'react';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { useEditorReadOnly } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { SparklesIcon } from 'lucide-react';

import { CheckPlugin } from '@/components/context/check-plugin';
import { Icons } from '@/components/icons';
import { AIToolbarButton } from '@/registry/default/plate-ui/ai-toolbar-button';
// import { AIToolbarButton } from '@/registry/default/plate-ui/ai-toolbar-button';
import { CommentToolbarButton } from '@/registry/default/plate-ui/comment-toolbar-button';
import { LinkToolbarButton } from '@/registry/default/plate-ui/link-toolbar-button';
import { MarkToolbarButton } from '@/registry/default/plate-ui/mark-toolbar-button';
import { ToolbarGroup } from '@/registry/default/plate-ui/toolbar';

import { PlaygroundMoreDropdownMenu } from './playground-more-dropdown-menu';
import { PlaygroundTurnIntoDropdownMenu } from './playground-turn-into-dropdown-menu';

export function PlaygroundFloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton
              className="text-purple-500 hover:text-purple-600"
              tooltip="Edit, generate, and more"
            >
              <SparklesIcon className="mr-1.5 !size-3.5" />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
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

            <CheckPlugin id="link" plugin={LinkPlugin}>
              <LinkToolbarButton />
            </CheckPlugin>
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CheckPlugin id="comment" plugin={CommentsPlugin}>
          <CommentToolbarButton />
        </CheckPlugin>

        {!readOnly && <PlaygroundMoreDropdownMenu />}
      </ToolbarGroup>
    </>
  );
}
