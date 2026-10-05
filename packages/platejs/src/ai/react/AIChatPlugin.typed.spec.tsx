import type { ChatTransport, UIMessage } from 'ai';
import type React from 'react';

import { definePlugin, useEditor, usePluginStore } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChat } from './useAIChat';

const Component = () => null;

const AIChatKitPlugin = definePlugin('typedAIChatKit', {
  dependencies: [AIChatPlugin],
  initialState: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
  slots: { afterEditable: AIChatControls },
});

function AIChatControls() {
  const { api } = useEditor().plugin(AIChatPlugin);
  const open: boolean = usePluginStore(AIChatPlugin, 'open');
  const chatOptions = usePluginStore(AIChatKitPlugin, 'chatOptions');
  const endpoint: string = chatOptions.api;

  return (
    <button
      aria-expanded={open}
      data-endpoint={endpoint}
      onClick={() => api.show()}
      type="button"
    >
      Open chat
    </button>
  );
}

const ConfiguredAIChatPlugin = AIChatPlugin.configure({
  component: Component,
  slots: {
    afterContainer: Component,
    afterEditable: Component,
  },
  shortcuts: {
    show: { keys: 'mod+j' },
  },
});

void ConfiguredAIChatPlugin;

function CustomAIView({
  editableRef,
  transport,
}: {
  editableRef: React.RefObject<HTMLElement | null>;
  transport: ChatTransport<UIMessage<unknown, { custom: { message: string } }>>;
}) {
  useAIChat({
    editableRef,
    transport,
    onData: (part, signal) => {
      const data: unknown = part.data;
      const requestSignal: AbortSignal = signal;
      void data;
      void requestSignal;
    },
  });
  return null;
}

void CustomAIView;
