'use client';

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from 'lucide-react';
import { ElementApi } from 'platejs';
import {
  TextAlignPlugin,
  useEditor,
  useEditorSelector,
  useSelectionFragmentProp,
} from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const items = [
  { icon: <AlignLeftIcon />, label: 'Left', value: 'left' },
  { icon: <AlignCenterIcon />, label: 'Center', value: 'center' },
  { icon: <AlignRightIcon />, label: 'Right', value: 'right' },
  { icon: <AlignJustifyIcon />, label: 'Justify', value: 'justify' },
] as const;

export function AlignToolbarButton() {
  const editor = useEditor();
  const value = useSelectionFragmentProp({
    getProp: (node) =>
      ElementApi.isElement(node) ? (node.textAlign ?? 'default') : undefined,
  });
  const block = useEditorSelector((current) =>
    current.read.selection()
      ? (current.read.nodes.blocks({ mode: 'lowest' })[0]?.[0] ?? null)
      : null
  );
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [rtl, setRtl] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // Unset, `start` and `end` alignment follow the block's drawn direction,
  // which Plite writes as `dir` on commit, so it is read after the DOM settles.
  React.useLayoutEffect(() => {
    const dom =
      (block && editor.api.dom.resolveDOMNode(block)) ?? triggerRef.current;

    setRtl(!!dom && getComputedStyle(dom).direction === 'rtl');
  }, [block, editor]);

  const explicit = items.find((item) => item.value === value)?.value;
  const physical =
    explicit ??
    (value === 'end' ? (rtl ? 'left' : 'right') : rtl ? 'right' : 'left');
  const icon = items.find((item) => item.value === physical)?.icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger ref={triggerRef}>
        <ToolbarButton
          data-align={physical}
          pressed={open}
          tooltip="Align"
          isDropdown
        >
          {icon}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={value === 'default' ? value : (explicit ?? '')}
          onValueChange={(newValue) => {
            const textAlign = editor.plugin(TextAlignPlugin);

            if (newValue === 'default') {
              textAlign.update.clear();

              return;
            }

            const alignment = items.find(
              (item) => item.value === newValue
            )?.value;

            if (alignment) textAlign.update.set(alignment);
          }}
        >
          <DropdownMenuRadioItem
            className="min-w-[160px]"
            finalFocus={() => editor.api.dom.focus()}
            value="default"
          >
            Default
          </DropdownMenuRadioItem>
          {items.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              className="min-w-[160px]"
              finalFocus={() => editor.api.dom.focus()}
              value={item.value}
            >
              {item.icon}
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
