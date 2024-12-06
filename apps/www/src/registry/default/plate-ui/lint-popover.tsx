'use client';

import React, { useEffect } from 'react';

import {
  focusEditor,
  useEditorPlugin,
  useHotkeys,
} from '@udecode/plate-common/react';

import { LintPlugin } from '@/components/editor/lint/lint-plugin';
import { useVirtualRefState } from '@/components/editor/lint/next/useVirtualRefState';
import { useTokenSelected } from '@/components/editor/lint/useTokenSelected';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/registry/default/potion-ui/popover';
import { Toolbar, ToolbarButton } from '@/registry/default/potion-ui/toolbar';

export function LintPopover() {
  const { api, editor, setOption, tf, useOption } = useEditorPlugin(LintPlugin);
  const activeToken = useOption('activeToken');
  const selected = useTokenSelected();
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const firstButtonRef = React.useRef<HTMLButtonElement>(null);
  const [virtualRef] = useVirtualRefState({
    at: activeToken?.range,
  });
  const suggestions = activeToken?.suggest ?? [];
  const open = selected && !!virtualRef?.current && suggestions.length > 0;

  useEffect(() => {
    if (!selected) {
      setOption('activeToken', null);
    }
  }, [selected, setOption]);

  useHotkeys(
    'ctrl+space',
    (e) => {
      if (api.lint.setSelectedActiveToken()) {
        e.preventDefault();
      }
    },
    { enabled: !open, enableOnContentEditable: true }
  );

  useHotkeys(
    'enter',
    (e) => {
      const suggestion = activeToken?.suggest?.[0];

      if (suggestion) {
        e.preventDefault();

        suggestion.fix({ goNext: true });
      }
    },
    { enabled: open, enableOnContentEditable: true }
  );

  useHotkeys(
    'down',
    (e) => {
      e.preventDefault();
      firstButtonRef.current?.focus();
    },
    { enabled: open, enableOnContentEditable: true }
  );
  useHotkeys(
    'up',
    (e) => {
      if (toolbarRef.current?.contains(document.activeElement)) {
        e.preventDefault();
        focusEditor(editor);
      }
    },
    { enabled: open, enableOnContentEditable: true }
  );

  useHotkeys(
    'tab',
    (e) => {
      if (tf.lint.focusNextMatch()) {
        e.preventDefault();
      }
    },
    { enabled: open, enableOnContentEditable: true }
  );

  useHotkeys(
    'shift+tab',
    (e) => {
      if (tf.lint.focusNextMatch({ reverse: true })) {
        e.preventDefault();
      }
    },
    { enabled: open, enableOnContentEditable: true }
  );

  return (
    <Popover open={open}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        className="w-auto !animate-none p-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          focusEditor(editor);
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOption('activeToken', null);
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Toolbar ref={toolbarRef} className="flex gap-0.5 px-2 py-1.5">
          {suggestions.map((suggestion, index) => (
            <ToolbarButton
              key={index}
              ref={index === 0 ? firstButtonRef : undefined}
              size="none"
              className="px-1 text-2xl"
              onClick={() => {
                suggestion.fix();
              }}
            >
              {suggestion.data?.emoji}
            </ToolbarButton>
          ))}
        </Toolbar>
      </PopoverContent>
    </Popover>
  );
}
