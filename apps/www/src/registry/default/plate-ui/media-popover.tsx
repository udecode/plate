import React, { useEffect } from 'react';
import {
  isCollapsed,
  isSelectionExpanded,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
} from '@udecode/plate-common';
import {
  floatingMediaActions,
  FloatingMedia as FloatingMediaPrimitive,
  useFloatingMediaSelectors,
} from '@udecode/plate-media';
import { useReadOnly, useSelected } from 'slate-react';

import { Icons } from '@/components/icons';

import { Button, buttonVariants } from './button';
import { inputVariants } from './input';
import { Popover, PopoverAnchor, PopoverContent } from './popover';
import { Separator } from './separator';

export interface MediaPopoverProps {
  pluginKey?: string;
  children: React.ReactNode;
}

export function MediaPopover({ pluginKey, children }: MediaPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);
  const isOpen = !readOnly && selected && selectionCollapsed;
  const isEditing = useFloatingMediaSelectors().isEditing();

  useEffect(() => {
    if (!isOpen && isEditing) {
      floatingMediaActions.isEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isEditing ? (
          <div className="flex w-[330px] flex-col">
            <div className="flex items-center">
              <div className="flex items-center pl-3 text-muted-foreground">
                <Icons.link className="h-4 w-4" />
              </div>

              <FloatingMediaPrimitive.UrlInput
                className={inputVariants({ variant: 'ghost', h: 'sm' })}
                placeholder="Paste the embed link..."
                options={{
                  pluginKey,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="box-content flex h-9 items-center gap-1">
            <FloatingMediaPrimitive.EditButton
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Edit link
            </FloatingMediaPrimitive.EditButton>

            <Separator orientation="vertical" className="my-1" />

            <Button variant="ghost" size="sms" {...buttonProps}>
              <Icons.delete className="h-4 w-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
