'use client';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { useEditorReadOnly } from 'platejs/react';
import * as React from 'react';

import { ToolbarGroup } from '@/registry/components/editor/toolbar';

import { AIToolbarButton } from './ai-toolbar-button';
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './equation-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { TurnIntoToolbarButton } from './turn-into-toolbar-classic-button';

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoToolbarButton />

            <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic (⌘+I)">
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              plugin={UnderlinePlugin}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              plugin={StrikethroughPlugin}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton plugin={CodePlugin} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}

      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreToolbarButton />}
      </ToolbarGroup>
    </>
  );
}
