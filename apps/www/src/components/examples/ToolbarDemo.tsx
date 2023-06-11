'use client';

import React, { useEffect } from 'react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { Plate } from '@udecode/plate-core';
import { KEY_DND } from '@udecode/plate-dnd';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { usePlaygroundPlugins } from './PlaygroundDemo';

import { settingsStore } from '@/components/context/settings-store';
import { Icons, iconVariants } from '@/components/icons';
import { ColorDropdownMenu } from '@/components/plate-ui/color-dropdown-menu';
import { InsertDropdownMenu } from '@/components/plate-ui/insert-dropdown-menu';
import { MarkToolbarButton } from '@/components/plate-ui/mark-toolbar-button';
import { TurnIntoDropdownMenu } from '@/components/plate-ui/turn-into-dropdown-menu';
import { Toolbar, ToolbarSeparator } from '@/components/ui/toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { usePlaygroundValue } from '@/plate/demo/values/usePlaygroundValue';

export function ToolbarDemo() {
  useEffect(() => {
    settingsStore.set.reset({
      exclude: [KEY_DND],
    });
  }, []);

  return (
    <Plate
      editableProps={editableProps}
      value={usePlaygroundValue()}
      plugins={usePlaygroundPlugins()}
      firstChildren={
        <Toolbar className="w-full rounded border-b border-b-border">
          <InsertDropdownMenu />

          <TurnIntoDropdownMenu />

          <ToolbarSeparator />

          <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
            <Icons.bold />
          </MarkToolbarButton>
          <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
            <Icons.italic />
          </MarkToolbarButton>
          <MarkToolbarButton
            tooltip="Underline (⌘+U)"
            nodeType={MARK_UNDERLINE}
          >
            <Icons.underline />
          </MarkToolbarButton>
          <MarkToolbarButton
            tooltip="Strikethrough (⌘+⇧+M)"
            nodeType={MARK_STRIKETHROUGH}
          >
            <Icons.strikethrough />
          </MarkToolbarButton>
          <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
            <Icons.code />
          </MarkToolbarButton>

          <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
            <Icons.color className={iconVariants({ variant: 'toolbar' })} />
          </ColorDropdownMenu>
          <ColorDropdownMenu nodeType={MARK_BG_COLOR} tooltip="Highlight Color">
            <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
          </ColorDropdownMenu>
        </Toolbar>
      }
    />
  );
}
