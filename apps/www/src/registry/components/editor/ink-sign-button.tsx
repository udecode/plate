'use client';

import { cn } from 'cn';
import { PenLineIcon } from 'lucide-react';
import { AuthoredPlugin } from 'platejs/authored';
import { InkCopyView, InkPlugin, type InkSign } from 'platejs/ink/react';
import { useEditor, useEditorSelector } from 'platejs/react';

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

const SIGN_TINT: Record<InkSign['state'], string> = {
  changed:
    'border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400',
  deleted:
    'border-destructive/40 bg-destructive/5 text-destructive/80 hover:bg-destructive/10',
  narrow: 'text-muted-foreground',
};

function MarginIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <rect height={18} rx={2} width={13} x={3} y={3} />
      <path d="M7 8h5M7 12h5M7 16h3" />
      <path d="M20 6v12" />
    </svg>
  );
}

export function InkSignButton({ sign }: { sign: InkSign }) {
  const editor = useEditor();
  const disabled = useEditorSelector(
    (current) => {
      if (current.read.view.isReadOnly()) return true;

      const authored = current.plugin(AuthoredPlugin);

      return authored.installed && 'preview' in authored.read.view();
    },
    { dependsOn: ['readOnly', 'authored'] }
  );
  const label = sign.digitized
    ? `Digitized ink (${SIGN_LABEL[sign.state].toLowerCase()})`
    : SIGN_LABEL[sign.state];
  const count = sign.marks.length;

  return (
    <FloatingPopover>
      <FloatingPopoverTrigger>
        <Button
          aria-label={`${label}: ${count}`}
          className={cn(
            'ms-1 h-5 w-auto max-w-9 gap-0.5 rounded-md px-1 [&_svg]:size-3',
            SIGN_TINT[sign.state],
            sign.digitized && 'border-dashed opacity-60'
          )}
          data-ink-sign-digitized={sign.digitized ? 'true' : undefined}
          data-ink-sign-state={sign.state}
          size="icon-xs"
          variant="outline"
        >
          {sign.state === 'narrow' ? <MarginIcon /> : <PenLineIcon />}
          <span aria-hidden className="text-[10px] leading-none tabular-nums">
            {count > 99 ? '99+' : count}
          </span>
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
        {sign.digitized ? (
          <Button
            className="mt-3 self-start"
            disabled={disabled}
            onClick={() =>
              editor.update((tx) =>
                tx.plugin(InkPlugin).setDigitized(sign.marks, false)
              )
            }
            size="sm"
            variant="outline"
          >
            Bring back
          </Button>
        ) : (
          <Button
            className="mt-3 self-start"
            disabled={disabled}
            onClick={() =>
              editor.update((tx) => tx.plugin(InkPlugin).remove(sign.marks))
            }
            size="sm"
            variant="destructive"
          >
            Delete
          </Button>
        )}
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}
