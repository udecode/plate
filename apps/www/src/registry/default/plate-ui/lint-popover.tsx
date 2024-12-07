'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  focusEditor,
  useEditorPlugin,
  useHotkeys,
} from '@udecode/plate-common/react';
import { useVirtualRefState } from '@udecode/plate-floating';
import {
  ExperimentalLintPlugin,
  useAnnotationSelected,
} from '@udecode/plate-lint/react';

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/registry/default/plate-ui/popover';
import { Separator } from '@/registry/default/plate-ui/separator';
import { Toolbar, ToolbarButton } from '@/registry/default/plate-ui/toolbar';

export function LintPopover() {
  const { api, editor, setOption, tf, useOption } = useEditorPlugin(
    ExperimentalLintPlugin
  );
  const activeAnnotations = useOption('activeAnnotations');
  const selected = useAnnotationSelected();
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const firstButtonRef = React.useRef<HTMLButtonElement>(null);
  const [virtualRef] = useVirtualRefState({
    at: activeAnnotations?.[0]?.range,
  });

  const open =
    selected &&
    !!virtualRef?.current &&
    activeAnnotations?.some((annotation) => annotation.suggest?.length);

  useHotkeys(
    'ctrl+space',
    (e) => {
      if (api.lint.setSelectedActiveAnnotations()) {
        e.preventDefault();
      }
    },
    { enableOnContentEditable: true, enabled: !open }
  );

  useHotkeys(
    'enter',
    (e) => {
      const suggestion = activeAnnotations?.[0]?.suggest?.[0];

      if (suggestion) {
        e.preventDefault();

        suggestion.fix({ goNext: true });
      }
    },
    { enableOnContentEditable: true, enabled: open }
  );

  useHotkeys(
    'down',
    (e) => {
      e.preventDefault();
      firstButtonRef.current?.focus();
    },
    { enableOnContentEditable: true, enabled: open }
  );
  useHotkeys(
    'up',
    (e) => {
      if (toolbarRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        focusEditor(editor);
      }
    },
    { enableOnContentEditable: true, enabled: open }
  );

  useHotkeys(
    'tab',
    (e) => {
      if (tf.lint.focusNextMatch()) {
        e.preventDefault();
      }
    },
    { enableOnContentEditable: true, enabled: open }
  );

  useHotkeys(
    'shift+tab',
    (e) => {
      if (tf.lint.focusNextMatch({ reverse: true })) {
        e.preventDefault();
      }
    },
    { enableOnContentEditable: true, enabled: open }
  );

  return (
    <Popover open={open}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        className={cn(
          'w-auto !animate-none overflow-hidden p-0',
          activeAnnotations?.[0]?.type !== 'emoji' && 'p-0'
        )}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          focusEditor(editor);
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOption('activeAnnotations', null);
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Toolbar ref={toolbarRef} className={cn('relative flex h-7 gap-0')}>
          {activeAnnotations?.map((annotation, anotIndex) => (
            <React.Fragment key={anotIndex}>
              <div className="peer flex gap-0">
                {annotation.suggest?.map((suggestion, suggIndex) => (
                  <ToolbarButton
                    key={suggIndex}
                    ref={suggIndex === 0 ? firstButtonRef : undefined}
                    className={cn(
                      'rounded-none font-normal hover:text-inherit focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0',
                      annotation.type === 'emoji'
                        ? 'p-1 text-xl'
                        : 'px-2 text-sm'
                    )}
                    onClick={() => {
                      suggestion.fix();
                    }}
                  >
                    {suggestion.data?.text as string}
                  </ToolbarButton>
                ))}
              </div>

              {anotIndex < activeAnnotations.length - 1 && (
                <Separator orientation="vertical" />
              )}
            </React.Fragment>
          ))}
        </Toolbar>
      </PopoverContent>
    </Popover>
  );
}
