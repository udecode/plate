'use client';

import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, PathApi, PLUGINS, nanoid } from 'platejs';
import { AIChatPlugin, AIPlugin } from 'platejs/ai/react';
import {
  PlateElement,
  PlateText,
  useEditor,
  useEditorPlugin,
  useEditorViewState,
  usePluginStore,
  type PlateElementProps,
  type PlateTextProps,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { AILoadingBar, AIMenu } from '@/registry/components/editor/ai-menu';

import { useChatChunk } from './baseline-chat-chunk';
import { AIChatTransportPlugin, useEditorChat } from './baseline-use-chat';

export function AILeaf(props: PlateTextProps<typeof AIPlugin>) {
  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const streamingLeaf = props.editor
    .plugin(AIChatPlugin)
    .read.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
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

export function AIAnchorElement(props: PlateElementProps<typeof AIChatPlugin>) {
  return (
    <PlateElement {...props}>
      <div className="h-[0.1px]" />
    </PlateElement>
  );
}

export const aiChatPlugin = AIChatTransportPlugin.extend({
  slots: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
  },
  shortcuts: { show: { keys: 'mod+j' } },
}).configure({ component: AIAnchorElement });

/** Mount once per editor object, with every view that grants this session DOM authority. */
export function AIChatSession({
  elements,
}: {
  elements: readonly HTMLElement[];
}) {
  const editor = useEditor();
  const { api } = usePluginStore(AIChatTransportPlugin, 'chatOptions');
  // The SDK retains its Chat instance across renders; a different editor or endpoint needs its own callbacks.
  const session = React.useMemo(
    () => ({ editor, api, key: nanoid() }),
    [editor, api]
  );

  return <AIChatSessionContent key={session.key} elements={elements} />;
}

function AIChatSessionContent({
  elements,
}: {
  elements: readonly HTMLElement[];
}) {
  const editor = useEditor();
  const { read, store } = useEditorPlugin(AIChatPlugin);
  const { store: sessionStore } = useEditorPlugin(AIChatTransportPlugin);
  const [sessionOwner] = React.useState(() => Symbol('AIChatSession'));
  const mounted = React.useRef(false);
  const viewElements = React.useRef(elements);
  const modelReadOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const isOwner = React.useCallback(
    () => mounted.current && sessionStore.get('_sessionOwner') === sessionOwner,
    [sessionOwner, sessionStore]
  );
  const isLive = React.useCallback(
    () =>
      isOwner() &&
      !editor.read.view.isReadOnly() &&
      viewElements.current.some(
        (element) =>
          element.isConnected &&
          element.getAttribute('data-readonly') !== 'true' &&
          element.getAttribute('aria-readonly') !== 'true' &&
          element.getAttribute('aria-disabled') !== 'true'
      ),
    [editor, isOwner]
  );

  React.useLayoutEffect(() => {
    viewElements.current = elements;
  }, [elements]);
  React.useLayoutEffect(() => {
    const currentOwner = sessionStore.get('_sessionOwner');

    if (currentOwner !== null && currentOwner !== sessionOwner) {
      throw new Error(
        'Only one AIChatSession may own this editor object. Mount it once in the shared editor assembly.'
      );
    }
    sessionStore.set({ _sessionOwner: sessionOwner });
    mounted.current = true;

    return () => {
      mounted.current = false;
      if (sessionStore.get('_sessionOwner') === sessionOwner) {
        sessionStore.set({ _sessionOwner: null });
      }
    };
  }, [sessionOwner, sessionStore]);

  const chat = useEditorChat({ isLive, isOwner });

  const mode = usePluginStore(AIChatPlugin, 'mode');
  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text: content }) => {
      if (!chat.isStreamingLive()) return;
      if (isFirst && mode === 'insert') {
        const selection = editor.read.selection();

        if (!selection) return;

        const { path, startBlock, startInEmptyParagraph } = read.insertStart();

        editor.plugin(AIPlugin).update.beginPreview({
          originalBlocks:
            startInEmptyParagraph &&
            startBlock &&
            ElementApi.isElement(startBlock)
              ? [cloneDeep(startBlock)]
              : [],
        });

        editor.update({ history: 'skip' }).nodes.insert(
          {
            children: [{ text: '' }],
            type: editor.plugin(PLUGINS.aiChat).schema.type,
          },
          {
            at: PathApi.next(path),
          }
        );
        store.set({ streaming: true });
      }

      if (mode === 'insert' && nodes.length > 0) {
        if (!store.get('streaming')) return;

        editor.plugin(AIChatPlugin).update.insertChunk(chunk, {
          autoScroll: true,
          textProps: {
            [editor.plugin(PLUGINS.ai).schema.key]: true,
          },
        });
      }

      if (toolName === 'edit' && mode === 'chat') {
        editor
          .plugin(AIChatPlugin)
          .update.applySuggestions(content, { split: isFirst });
      }
    },
    onFinish: () => {
      chat.finish();
    },
  });
  const stop = React.useEffectEvent(() => {
    void chat.stop();
  });
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!isLive()) stop();
    });
    for (const element of elements) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-readonly', 'aria-readonly', 'aria-disabled'],
      });
    }
    if (!isLive()) stop();
    return () => observer.disconnect();
  }, [elements, modelReadOnly, isLive]);
  return null;
}

export const AIKit = [AIPlugin.configure({ component: AILeaf }), aiChatPlugin];
