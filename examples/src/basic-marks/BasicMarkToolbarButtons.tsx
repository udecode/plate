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
  MarkToolbarButton,
} from '@udecode/plate';
import { Icons } from '../common/icons';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});

export function BasicMarkToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton
        tooltip={tooltip('Bold (⌘+B)')}
        type={getPluginType(editor, MARK_BOLD)}
        icon={<Icons.bold />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Italic (⌘+I)')}
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<Icons.italic />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Underline (⌘+U)')}
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<Icons.underline />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Strikethrough (⌘+⇧+M)')}
        type={getPluginType(editor, MARK_STRIKETHROUGH)}
        icon={<Icons.strikethrough />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Code (⌘+E)')}
        type={getPluginType(editor, MARK_CODE)}
        icon={<Icons.code />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Superscript (⌘+,)')}
        type={getPluginType(editor, MARK_SUPERSCRIPT)}
        clear={getPluginType(editor, MARK_SUBSCRIPT)}
        icon={<Icons.superscript />}
      />
      <MarkToolbarButton
        tooltip={tooltip('Subscript (⌘+.)')}
        type={getPluginType(editor, MARK_SUBSCRIPT)}
        clear={getPluginType(editor, MARK_SUPERSCRIPT)}
        icon={<Icons.subscript />}
      />
    </>
  );
}
