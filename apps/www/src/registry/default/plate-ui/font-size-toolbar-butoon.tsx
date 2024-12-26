'use client';
import { useState } from 'react';

import { cn } from '@udecode/cn';
import {
  type TElement,
  getAboveNode,
  getMarks,
  setMarks,
} from '@udecode/plate-common';
import {
  focusEditor,
  useEditorPlugin,
  useEditorSelector,
} from '@udecode/plate-common/react';
import { BaseFontSizePlugin } from '@udecode/plate-font';
import { FontSizePlugin } from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { Minus, Plus } from 'lucide-react';

import { ToolbarButton } from './toolbar';

const DEFAULT_FONT_SIZE = '16px';

const FONT_SIZE_MAP = {
  [HEADING_KEYS.h1]: '36px',
  [HEADING_KEYS.h2]: '24px',
  [HEADING_KEYS.h3]: '20px',
};

const pxUnitConfig = {
  increment: 1,
  unitRegex: /^([\d.]+)px$/i,
};

const remUnitConfig = {
  increment: 0.125,
  unitRegex: /^([\d.]+)rem$/i,
};

export function FontSizeToolbarButton() {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { api, editor } = useEditorPlugin(BaseFontSizePlugin);
  const setChangedFontSize = api.fontSize.setChangedFontSize;

  const cursorFontSize = useEditorSelector((editor) => {
    const marks = getMarks(editor) || {};

    if (marks[FontSizePlugin.key]) return marks[FontSizePlugin.key] as string;

    const entry = getAboveNode<TElement>(editor, {
      at: editor.selection?.focus,
    });

    if (!entry) return DEFAULT_FONT_SIZE;

    const [node] = entry;

    if (node.type in FONT_SIZE_MAP)
      return FONT_SIZE_MAP[node.type as keyof typeof FONT_SIZE_MAP];

    return DEFAULT_FONT_SIZE;
  }, []);

  const handleInputChange = () => {
    if (inputValue && inputValue !== cursorFontSize) {
      setMarks(editor, {
        [FontSizePlugin.key]: inputValue,
      });
    }

    focusEditor(editor);
  };

  const displayValue = isFocused ? inputValue : cursorFontSize;

  return (
    <div className="flex items-center gap-1 rounded-md bg-muted/60 p-0">
      <ToolbarButton
        onClick={() => {
          setChangedFontSize({
            fontSize: displayValue,
            increase: false,
            unitConfig: [pxUnitConfig, remUnitConfig],
          });
          focusEditor(editor);
        }}
      >
        <Minus />
      </ToolbarButton>
      <input
        className={cn('w-16 bg-transparent px-2 text-center hover:bg-muted')}
        value={displayValue}
        onBlur={() => {
          setIsFocused(false);
          handleInputChange();
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setInputValue(cursorFontSize);
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleInputChange()}
        data-plate-focus="true"
        type="text"
      />
      <ToolbarButton
        onClick={() => {
          setChangedFontSize({
            fontSize: displayValue,
            increase: true,
            unitConfig: [pxUnitConfig, remUnitConfig],
          });
          focusEditor(editor);
        }}
      >
        <Plus />
      </ToolbarButton>
    </div>
  );
}
