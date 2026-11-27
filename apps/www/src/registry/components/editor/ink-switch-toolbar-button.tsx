'use client';

import { EyeIcon, EyeOffIcon, Trash2Icon } from 'lucide-react';
import { AuthoredPlugin } from 'platejs/authored';
import { BaseInkPlugin } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import { useEditor, useEditorSelector, useViewStore } from 'platejs/react';
import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function InkSwitchToolbarButton() {
  const editor = useEditor();
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);
  const showDigitized = useViewStore(InkPlugin, (state) => state.showDigitized);
  const readOnly = useEditorSelector(
    (current) => {
      if (current.read.view.isReadOnly()) return true;

      const authored = current.plugin(AuthoredPlugin);

      return authored.installed && 'preview' in authored.read.view();
    },
    { dependsOn: ['readOnly', 'authored'] }
  );
  const hasDigitized = useEditorSelector((current) => {
    const ink = current.plugin(BaseInkPlugin);

    return ink.read.marks().length > ink.read.shownMarks().length;
  });
  const [open, setOpen] = React.useState(false);
  const [confirmDropOpen, setConfirmDropOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger>
          <ToolbarButton
            aria-label="Ink visibility"
            isDropdown
            pressed={open || hidden || showDigitized}
            tooltip="Ink visibility"
          >
            {hidden ? <EyeOffIcon /> : <EyeIcon />}
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuCheckboxItem
            checked={hidden}
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() => editor.plugin(InkPlugin).api.setHidden(!hidden)}
          >
            Hide ink
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={showDigitized}
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() =>
              editor.plugin(InkPlugin).api.setShowDigitized(!showDigitized)
            }
          >
            Show digitized ink
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={readOnly || !hasDigitized}
            onSelect={() => setConfirmDropOpen(true)}
            variant="destructive"
          >
            <Trash2Icon />
            Drop digitized ink
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDropOpen} onOpenChange={setConfirmDropOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Drop digitized ink?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes all digitized ink marks and their saved
              block copies. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                editor.update((tx) => {
                  tx.plugin(BaseInkPlugin).dropDigitized();
                });
                setConfirmDropOpen(false);
              }}
              variant="destructive"
            >
              Drop digitized ink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
