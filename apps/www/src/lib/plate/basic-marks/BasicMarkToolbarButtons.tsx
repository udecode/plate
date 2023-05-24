import React from 'react';
import {
  getPluginType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export function BasicMarkToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton
        tooltip="Bold (⌘+B)"
        nodeType={getPluginType(editor, MARK_BOLD)}
      >
        <Icons.bold />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Italic (⌘+I)"
        nodeType={getPluginType(editor, MARK_ITALIC)}
      >
        <Icons.italic />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Underline (⌘+U)"
        nodeType={getPluginType(editor, MARK_UNDERLINE)}
      >
        <Icons.underline />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Strikethrough (⌘+⇧+M)"
        nodeType={getPluginType(editor, MARK_STRIKETHROUGH)}
      >
        <Icons.strikethrough />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Code (⌘+E)"
        nodeType={getPluginType(editor, MARK_CODE)}
      >
        <Icons.code />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Superscript (⌘+,)"
        nodeType={getPluginType(editor, MARK_SUPERSCRIPT)}
        clear={getPluginType(editor, MARK_SUBSCRIPT)}
      >
        <Icons.superscript />
      </MarkToolbarButton>
      <MarkToolbarButton
        tooltip="Subscript (⌘+.)"
        nodeType={getPluginType(editor, MARK_SUBSCRIPT)}
        clear={getPluginType(editor, MARK_SUPERSCRIPT)}
      >
        <Icons.subscript />
      </MarkToolbarButton>
    </>
  );
}
