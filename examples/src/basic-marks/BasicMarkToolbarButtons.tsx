import React from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { Subscript } from '@styled-icons/foundation/Subscript';
import { Superscript } from '@styled-icons/foundation/Superscript';
import { FormatBold } from '@styled-icons/material/FormatBold';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
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
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton
        tooltip={{ content: 'Bold' }}
        type={getPluginType(editor, MARK_BOLD)}
        icon={<FormatBold />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Italic' }}
        type={getPluginType(editor, MARK_ITALIC)}
        icon={<FormatItalic />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Underline' }}
        type={getPluginType(editor, MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Strikethrough' }}
        type={getPluginType(editor, MARK_STRIKETHROUGH)}
        icon={<FormatStrikethrough />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Code' }}
        type={getPluginType(editor, MARK_CODE)}
        icon={<CodeAlt />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Superscript' }}
        type={getPluginType(editor, MARK_SUPERSCRIPT)}
        clear={getPluginType(editor, MARK_SUBSCRIPT)}
        icon={<Superscript />}
      />
      <MarkToolbarButton
        tooltip={{ content: 'Subscript' }}
        type={getPluginType(editor, MARK_SUBSCRIPT)}
        clear={getPluginType(editor, MARK_SUPERSCRIPT)}
        icon={<Subscript />}
      />
    </>
  );
};
