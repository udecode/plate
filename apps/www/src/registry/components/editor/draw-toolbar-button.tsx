'use client';

import {
  EraserIcon,
  HighlighterIcon,
  LassoIcon,
  PenToolIcon,
} from 'lucide-react';
import type { InkTool } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import { useEditor, useEditorReadOnly, useViewStore } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from '@/registry/components/editor/toolbar';

const TOOLS = {
  eraser: { size: 16, type: 'erase' },
  highlighter: {
    brush: { color: '#facc15', opacity: 0.4, size: 16 },
    type: 'draw',
  },
  lasso: { type: 'lasso' },
  pen: { brush: { color: '#2563eb', opacity: 1, size: 2.5 }, type: 'draw' },
} satisfies Record<string, InkTool>;

const TOOL_ITEMS = [
  { icon: <PenToolIcon />, label: 'Pen', tool: TOOLS.pen },
  { icon: <HighlighterIcon />, label: 'Highlighter', tool: TOOLS.highlighter },
  { icon: <EraserIcon />, label: 'Eraser', tool: TOOLS.eraser },
  { icon: <LassoIcon />, label: 'Lasso', tool: TOOLS.lasso },
] as const;

export function DrawToolbarButton() {
  const editor = useEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState<(typeof TOOL_ITEMS)[number]>(
    TOOL_ITEMS[0]
  );
  const on = tool !== null;

  return (
    <ToolbarSplitButton pressed={open}>
      <ToolbarSplitButtonPrimary
        aria-label="Draw"
        aria-pressed={on}
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        disabled={readOnly}
        onClick={() =>
          editor.plugin(InkPlugin).api.setTool(on ? null : last.tool)
        }
        data-state={on ? 'on' : 'off'}
      >
        {last.icon}
      </ToolbarSplitButtonPrimary>

      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger>
          <ToolbarSplitButtonSecondary
            aria-label="Draw tools"
            disabled={readOnly}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuRadioGroup value={last.label}>
            {TOOL_ITEMS.map((item) => (
              <DropdownMenuRadioItem
                className="*:[svg]:text-muted-foreground"
                finalFocus={() => editor.api.dom.focus()}
                key={item.label}
                onSelect={() => {
                  setLast(item);
                  editor.plugin(InkPlugin).api.setTool(item.tool);
                }}
                value={item.label}
              >
                {item.icon}
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}
