'use client';
import { ElementApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import {
  ChevronRightIcon,
  Code2Icon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from 'lucide-react';
import { useEditor, useSelectionFragmentProp } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  ToolbarButton,
  ToolbarMenuGroup,
} from '@/registry/components/editor/toolbar';
import {
  getBlockType,
  applyBlockAction,
} from '@/registry/components/editor/transforms-classic';

const ACTION_THREE_COLUMNS = 'action_three_columns';

const turnIntoItems = [
  {
    icon: <PilcrowIcon />,
    label: 'Text',
    value: PLUGINS.paragraph,
  },
  {
    icon: <Heading1Icon />,
    label: 'Heading 1',
    value: 'heading-1',
  },
  {
    icon: <Heading2Icon />,
    label: 'Heading 2',
    value: 'heading-2',
  },
  {
    icon: <Heading3Icon />,
    label: 'Heading 3',
    value: 'heading-3',
  },
  {
    icon: <Heading4Icon />,
    label: 'Heading 4',
    value: 'heading-4',
  },
  {
    icon: <Heading5Icon />,
    label: 'Heading 5',
    value: 'heading-5',
  },
  {
    icon: <Heading6Icon />,
    label: 'Heading 6',
    value: 'heading-6',
  },
  {
    icon: <ListIcon />,
    label: 'Bulleted list',
    value: PLUGINS.bulletedList,
  },
  {
    icon: <ListOrderedIcon />,
    label: 'Numbered list',
    value: PLUGINS.numberedList,
  },
  {
    icon: <SquareIcon />,
    label: 'To-do list',
    value: PLUGINS.taskList,
  },
  {
    icon: <ChevronRightIcon />,
    label: 'Toggle list',
    value: PLUGINS.toggle,
  },
  {
    icon: <FileCodeIcon />,
    label: 'Code',
    value: PLUGINS.codeBlock,
  },
  {
    icon: <Code2Icon />,
    label: 'Code Drawing',
    value: PLUGINS.codeDrawing,
  },
  {
    icon: <QuoteIcon />,
    label: 'Quote',
    value: PLUGINS.blockquote,
  },
  {
    icon: <Columns3Icon />,
    label: '3 columns',
    value: ACTION_THREE_COLUMNS,
  },
];

export function TurnIntoToolbarButton() {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  const documentValue = useSelectionFragmentProp({
    defaultValue: editor.plugin(PLUGINS.paragraph).schema.type,
    getProp: (node) =>
      ElementApi.isElement(node) ? getBlockType(node) : undefined,
  });
  const selectedDocumentValue =
    typeof documentValue === 'string' ? documentValue : PLUGINS.paragraph;
  const selectedValue =
    turnIntoItems.find(({ value }) => {
      if (value === ACTION_THREE_COLUMNS) return false;
      if (value.startsWith('heading-')) {
        return value === selectedDocumentValue;
      }
      const plugin = editor.plugin(value);

      return plugin.installed && plugin.schema.type === selectedDocumentValue;
    })?.value ?? selectedDocumentValue;
  const selectedItem = React.useMemo(
    () =>
      turnIntoItems.find((item) => item.value === selectedValue) ??
      turnIntoItems[0],
    [selectedValue]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton
          className="min-w-[125px]"
          pressed={open}
          tooltip="Turn into"
          isDropdown
        >
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onFinalFocus={(e) => {
          e.preventDefault();
          editor.api.dom.focus();
        }}
        align="start"
      >
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={(action) => {
            applyBlockAction(editor, action);
          }}
        >
          <ToolbarMenuGroup label="Turn into">
            {turnIntoItems.map(({ icon, label, value: itemValue }) => (
              <DropdownMenuRadioItem
                key={itemValue}
                className="min-w-[180px] pl-2 *:first:[span]:hidden"
                value={itemValue}
              >
                {icon}
                {label}
              </DropdownMenuRadioItem>
            ))}
          </ToolbarMenuGroup>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
