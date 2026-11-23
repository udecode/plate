'use client';

import { BracesIcon } from 'lucide-react';
import { BaseFieldPlugin } from 'platejs/field';
import { useEditor, useEditorReadOnly, usePluginStore } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const KINDS = [
  { kind: 'text', label: 'Text' },
  { kind: 'number', label: 'Number' },
  { kind: 'date', label: 'Date' },
  { kind: 'checkbox', label: 'Checkbox' },
  { kind: 'choice', label: 'Choice' },
  { kind: 'signature', label: 'Signature' },
] as const;

export function FieldToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const filling = usePluginStore(
    BaseFieldPlugin,
    (state) => state.fillRole != null
  );
  const [open, setOpen] = React.useState(false);

  if (open && (readOnly || filling)) setOpen(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger disabled={readOnly || filling}>
        <ToolbarButton pressed={open} tooltip="Insert field" isDropdown>
          <BracesIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        {KINDS.map(({ kind, label }) => (
          <DropdownMenuItem
            key={kind}
            className="min-w-[180px]"
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() => {
              const fields = editor.plugin(BaseFieldPlugin);
              const role = fields.read.fields()[0]?.node.role ?? 'signer';

              editor.update((tx) => {
                tx.plugin(BaseFieldPlugin).insert(
                  { kind, label, role },
                  { select: true }
                );
              });
            }}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
