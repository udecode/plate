'use client';

import React from 'react';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { useEditorReadOnly } from '@udecode/plate-common/react';
import { Bold, Code, Italic, Strikethrough, Underline } from 'lucide-react';

import { ToolbarGroup } from './toolbar';

// import { AIToolbarButton } from './ai-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          {/* <ToolbarGroup>
            <AIToolbarButton
              className="text-purple-500 hover:text-purple-600"
              tooltip="Edit, generate, and more"
            >
              <SparklesIcon className="mr-1.5 !size-3.5" />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup> */}

          <ToolbarGroup>
            <TurnIntoDropdownMenu />

            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <Bold />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <Italic />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <Underline />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <Strikethrough />
            </MarkToolbarButton>
            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Code />
            </MarkToolbarButton>
          </ToolbarGroup>
        </>
      )}
    </>
  );
}
