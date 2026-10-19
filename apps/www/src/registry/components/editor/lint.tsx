'use client';

import { BaseCodeBlockPlugin, type Editor, type Element } from 'platejs';
import { BaseLintPlugin, type LintRule } from 'platejs/lint';
import {
  type EditableSiblingProps,
  toReactPlugin,
  useEditor,
  useEditorFocused,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';

export const isProse = (editor: Editor, block: Element) => {
  const codeBlock = editor.plugin(BaseCodeBlockPlugin);

  return !codeBlock.installed || block.type !== codeBlock.schema.type;
};

export const fillerWords: LintRule = {
  id: 'style/filler-words',
  severity: 'warning',
  check: (text, { block, editor }) => {
    if (!isProse(editor, block)) return [];

    let previousEnd = 0;

    return Array.from(
      text.matchAll(/\b(?:actually|basically|really|very)\b/gi),
      (match) => {
        const after = match.index + match[0].length;
        const spaceBefore =
          match.index > previousEnd && text[match.index - 1] === ' ';
        const start = spaceBefore ? match.index - 1 : match.index;
        const end = !spaceBefore && text[after] === ' ' ? after + 1 : after;

        previousEnd = end;

        return {
          start,
          end,
          message: `Cut the filler word "${match[0]}".`,
          fixes: [''],
        };
      }
    );
  },
};

export const commaSpacing: LintRule = {
  id: 'style/comma-spacing',
  severity: 'error',
  check: (text, { block, editor }) =>
    isProse(editor, block)
      ? Array.from(text.matchAll(/ , ?/g), (match) => ({
          start: match.index,
          end: match.index + match[0].length,
          message: 'Remove the space before commas.',
          fixes: [', '],
        }))
      : [],
};

/** Findings in document order, read again whenever the list changes. */
export function useLintFindings() {
  const lint = useEditor().plugin(BaseLintPlugin);

  return React.useSyncExternalStore(
    lint.store.subscribe,
    lint.api.findings,
    lint.api.findings
  );
}

/** The finding under the selection focus, or null. */
export function useLintFindingAt() {
  const editor = useEditor();
  const lint = editor.plugin(BaseLintPlugin);
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const offStore = lint.store.subscribe(onChange);
      const offCommit = editor.subscribeCommit(onChange);

      return () => {
        offStore();
        offCommit();
      };
    },
    [editor, lint]
  );

  return React.useSyncExternalStore(subscribe, lint.api.at, lint.api.at);
}

export function LintPopover({ editableRef }: EditableSiblingProps) {
  const editor = useEditor();
  const lint = editor.plugin(BaseLintPlugin);
  const finding = useLintFindingAt();
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const id = finding?.id;
  // A new anchor per finding moves the popover; it sits under the finding's
  // first painted segment, or under the caret before the paint catches up.
  const anchor = React.useMemo(
    () =>
      id === undefined
        ? null
        : {
            get contextElement() {
              return editableRef.current ?? undefined;
            },
            getBoundingClientRect: () => {
              const painted = editableRef.current?.querySelector(
                `[data-lint-id="${CSS.escape(id)}"]`
              );

              if (painted) return painted.getBoundingClientRect();

              const selection = editor.read.selection();
              const range =
                selection && editor.api.dom.resolveDOMRange(selection);

              return range?.getBoundingClientRect() ?? new DOMRect();
            },
          },
    [editableRef, editor, id]
  );

  if (!finding || !focused || readOnly) return null;

  return (
    <FloatingPopover open>
      <FloatingPopoverAnchor element={anchor} />
      <FloatingPopoverContent
        align="start"
        className="flex w-auto max-w-80 flex-col gap-2 p-3"
        data-severity={finding.severity}
        data-slot="lint-popover"
        onFinalFocus={(event) => event.preventDefault()}
        onInitialFocus={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
        side="bottom"
      >
        <p className="text-sm">{finding.message}</p>
        <p className="text-xs text-muted-foreground">{finding.ruleId}</p>
        {finding.fixes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {finding.fixes.map((fix, index) => (
              <Button
                key={fix}
                onClick={() => lint.update.fix(finding.id, index)}
                size="sm"
                variant="secondary"
              >
                {fix.trim() === '' ? 'Remove' : fix}
              </Button>
            ))}
            <Button
              onClick={() => {
                if (lint.update.fix(finding.id)) lint.update.move(1);
              }}
              size="sm"
              variant="ghost"
            >
              Fix and next
            </Button>
          </div>
        )}
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}

export const LintKit = [
  toReactPlugin(BaseLintPlugin).configure({
    initialState: { rules: [fillerWords, commaSpacing] },
    decorate: {
      attributes: {
        className:
          'underline decoration-wavy decoration-from-font underline-offset-4 data-[lint-severity=error]:decoration-destructive data-[lint-severity=info]:decoration-sky-500 data-[lint-severity=warning]:decoration-amber-500',
      },
    },
    shortcuts: {
      next: {
        keys: 'f8',
        handler: ({ editor }) => {
          editor.plugin(BaseLintPlugin).update.move(1);
        },
      },
      previous: {
        keys: 'shift+f8',
        handler: ({ editor }) => {
          editor.plugin(BaseLintPlugin).update.move(-1);
        },
      },
    },
    slots: { afterEditable: LintPopover },
  }),
] as const;
