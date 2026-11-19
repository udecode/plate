'use client';

import { PenLineIcon } from 'lucide-react';
import { InkCopyView, InkPlugin, type InkSign } from 'platejs/ink/react';
import { useEditor, useEditorReadOnly } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';

const SIGN_LABEL: Record<InkSign['state'], string> = {
  changed: 'Ink no longer on its words',
  deleted: 'Ink on deleted text',
  narrow: 'Ink outside a narrow margin',
};

export function InkSignButton({ sign }: { sign: InkSign }) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const label = SIGN_LABEL[sign.state];

  return (
    <FloatingPopover>
      <FloatingPopoverTrigger>
        <Button
          aria-label={`${label}: ${sign.marks.length}`}
          className="ms-1 text-muted-foreground"
          size="icon-xs"
          variant="outline"
        >
          <PenLineIcon />
        </Button>
      </FloatingPopoverTrigger>
      <FloatingPopoverContent
        align="start"
        className="flex max-h-[min(80dvh,calc(-24px+var(--floating-popover-available-height)))] w-auto max-w-[min(90vw,48rem)] flex-col"
      >
        <div className="mb-2 text-sm font-medium">{label}</div>
        <div className="min-h-0 flex-1 overflow-auto">
          <InkCopyView marks={sign.marks} />
        </div>
        <Button
          className="mt-3 self-start"
          disabled={readOnly}
          onClick={() =>
            editor.update((tx) => tx.plugin(InkPlugin).remove(sign.marks))
          }
          size="sm"
          variant="destructive"
        >
          Delete
        </Button>
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}
