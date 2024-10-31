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
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  SparklesIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';

import { CheckPlugin } from '@/components/context/check-plugin';
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
              className="gap-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-500"
              tooltip="Edit, generate, and more"
            >
              <SparklesIcon className="!size-3.5" />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <PlaygroundTurnIntoDropdownMenu />

            <CheckPlugin plugin={BoldPlugin}>
              <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                <BoldIcon />
              </MarkToolbarButton>
            </CheckPlugin>

            <CheckPlugin plugin={ItalicPlugin}>
              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <ItalicIcon />
              </MarkToolbarButton>
            </CheckPlugin>

            <CheckPlugin plugin={UnderlinePlugin}>
              <MarkToolbarButton
                nodeType={UnderlinePlugin.key}
                tooltip="Underline (⌘+U)"
              >
                <UnderlineIcon />
              </MarkToolbarButton>
            </CheckPlugin>

            <CheckPlugin plugin={StrikethroughPlugin}>
              <MarkToolbarButton
                nodeType={StrikethroughPlugin.key}
                tooltip="Strikethrough (⌘+⇧+M)"
              >
                <StrikethroughIcon />
              </MarkToolbarButton>
            </CheckPlugin>

            <CheckPlugin plugin={CodePlugin}>
              <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
                <Code2Icon />
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
