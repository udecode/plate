'use client';
import { type TElement, getAboveNode, getMarks } from '@udecode/plate-common';
import { useEditorSelector } from '@udecode/plate-common/react';
import { FontSizePlugin } from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { Minus, Plus } from 'lucide-react';

import { ToolbarButton } from './toolbar';

const FONT_SIZE_MAP = {
  [HEADING_KEYS.h1]: '36px',
  [HEADING_KEYS.h2]: '24px',
  [HEADING_KEYS.h3]: '20px',
};

export const FontSizeToolbarButton = () => {
  // const { api } = useEditorPlugin(FontSizePlugin);
  // const setChangedFontSize = api.fontSize.setChangedFontSize;

  const cursorFontSize = useEditorSelector((editor) => {
    const marks = getMarks(editor) || {};

    if (marks[FontSizePlugin.key]) return marks[FontSizePlugin.key] as string;

    const entry = getAboveNode<TElement>(editor, {
      at: editor.selection?.focus,
    });

    if (!entry) return '16px';

    const [node] = entry;

    if (node.type in FONT_SIZE_MAP)
      return FONT_SIZE_MAP[node.type as keyof typeof FONT_SIZE_MAP];

    return '16px';
  }, []);

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/70 p-0">
      <ToolbarButton
        // onClick={() =>
        //   setChangedFontSize({ fontSize: cursorFontSize, increase: false })
        // }
        onMouseDown={(e) => e.preventDefault()}
      >
        <Minus />
      </ToolbarButton>
      <ToolbarButton>{cursorFontSize as string}</ToolbarButton>
      <ToolbarButton
        // onClick={() =>
        //   setChangedFontSize({ fontSize: cursorFontSize, increase: true })
        // }
        onMouseDown={(e) => e.preventDefault()}
      >
        <Plus />
      </ToolbarButton>
    </div>
  );
};
