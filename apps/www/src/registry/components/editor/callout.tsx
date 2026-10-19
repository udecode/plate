'use client';

import { CalloutPlugin } from 'platejs/callout/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

import { EmojiPicker } from './emoji-picker';

export function CalloutElement(
  props: EditorElementProps<typeof CalloutPlugin>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <EditorElement
      {...props}
      className="my-1 flex rounded-sm bg-muted p-4 pl-3"
      style={{
        backgroundColor: props.element.backgroundColor,
      }}
      attributes={{
        ...props.attributes,
        'data-editor-open-context-menu': true,
      }}
    >
      <div className="flex w-full gap-2 rounded-md">
        <EmojiPicker
          onEmojiSelect={(icon) => {
            editor.update.nodes.set({ icon }, { at: props.element });
          }}
        >
          <Button
            disabled={readOnly}
            variant="ghost"
            className="size-6 p-1 text-[18px] select-none hover:bg-muted-foreground/15"
            style={{
              fontFamily:
                '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
            }}
            contentEditable={false}
          >
            {props.element.icon || '💡'}
          </Button>
        </EmojiPicker>
        <div className="w-full">{props.children}</div>
      </div>
    </EditorElement>
  );
}

export const CalloutKit = [
  CalloutPlugin.configure({ component: CalloutElement }),
];
