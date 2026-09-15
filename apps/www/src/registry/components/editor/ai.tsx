'use client';

import { AIChatPlugin, AIPlugin } from 'platejs/ai/react';
import {
  EditorElement,
  EditorText,
  usePluginStore,
  type EditorElementProps,
  type EditorTextProps,
} from 'platejs/react';

import { cn } from '@/lib/utils';
import { AILoadingBar, AIMenu } from '@/registry/components/editor/ai-menu';

import { AIChatTransportPlugin, useEditorChat } from './use-chat';

export function AILeaf(props: EditorTextProps<typeof AIPlugin>) {
  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const streamingLeaf = props.editor
    .plugin(AIChatPlugin)
    .read.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <EditorText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out',
        isLast &&
          streaming &&
          'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:rounded-full after:bg-primary after:align-middle after:content-[""]'
      )}
      {...props}
    />
  );
}

export function AIAnchorElement(
  props: EditorElementProps<typeof AIChatPlugin>
) {
  return (
    <EditorElement {...props}>
      <div className="h-[0.1px]" />
    </EditorElement>
  );
}

export const AIKit = [
  AIPlugin.configure({ component: AILeaf }),
  AIChatTransportPlugin.extend(({ api, store }) => ({
    slots: {
      afterContainer: AILoadingBar,
      afterEditable: AIMenu,
      // oxlint-disable-next-line eslint/func-name-matching -- Hooks require a named React component in this slot.
      wrapRoot: function AIIntegration({ children, editableRef }) {
        useEditorChat(editableRef);
        return children;
      },
    },
    shortcuts: {
      show: { keys: 'mod+j' },
      stop: {
        keys: 'escape',
        handler: () => {
          const status = store.get().chat?.status;
          if (status !== 'streaming' && status !== 'submitted') return false;
          api.stop();
          return true;
        },
      },
    },
  })).configure({ component: AIAnchorElement }),
];
