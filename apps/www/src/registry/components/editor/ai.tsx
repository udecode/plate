'use client';

import { BaseParagraphPlugin } from 'platejs';
import { AIChatPlugin, AIPlugin } from 'platejs/ai/react';
import {
  EditorText,
  usePluginStore,
  type EditorTextProps,
  type RenderNodeWrapperProps,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  AIChatEditor,
  AILoadingBar,
  AIMenu,
} from '@/registry/components/editor/ai-menu';

import { AIChatTransportPlugin, useEditorChat } from './use-chat';

export function AILeaf(props: EditorTextProps<typeof AIPlugin>) {
  return (
    <EditorText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out'
      )}
      {...props}
    />
  );
}

function AIInlinePreview({
  children,
  editor,
  element,
}: RenderNodeWrapperProps) {
  const replacesEmptyParagraph =
    element.type === editor.plugin(BaseParagraphPlugin).schema.type &&
    editor.read.nodes.isEmpty(element);
  return (
    <div data-editor-ai-preview-wrapper="">
      <div hidden={replacesEmptyParagraph}>{children}</div>
      <div contentEditable={false} data-editor-ai-preview="">
        <AIChatEditor inline />
      </div>
    </div>
  );
}

export const AIKit = [
  AIPlugin.configure({ component: AILeaf }),
  AIChatTransportPlugin.extend(({ api, store }) => ({
    render: {
      useViewElementAttributes() {
        const key = usePluginStore(AIChatPlugin, (state) =>
          state.mode === 'insert' && state.previewValue.length > 0
            ? state._blockKey
            : null
        );

        return key
          ? [{ key, attributes: { 'data-editor-ai-preview-anchor': '' } }]
          : [];
      },
    },
    slots: {
      wrapNode: {
        component: AIInlinePreview,
        match: ({ editor, element }) => {
          const state = store.get();
          return (
            state.mode === 'insert' &&
            state.previewValue.length > 0 &&
            editor.key(element) === state._blockKey
          );
        },
      },
      afterContainer: AILoadingBar,
      afterEditable: AIMenu,
      // oxlint-disable-next-line eslint/func-name-matching -- Hooks require a named React component in this slot.
      wrapRoot: function AIIntegration({ children, editableRef }) {
        useEditorChat(editableRef);
        return children;
      },
    },
    shortcuts: {
      show: {
        keys: 'mod+j',
        handler: ({ editor }) => {
          editor.plugin(AIChatPlugin).api.show();
        },
      },
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
  })),
];
