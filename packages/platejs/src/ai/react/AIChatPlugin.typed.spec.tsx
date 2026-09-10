import type { ChatTransport, UIMessage } from 'ai';
import type React from 'react';

import {
  definePlatePlugin,
  useEditorPlugin,
  usePluginStore,
} from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChat } from './useAIChat';

const Component = () => null;

const AIChatKitPlugin = definePlatePlugin('typedAIChatKit', {
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
  const { api } = useEditorPlugin(AIChatPlugin);
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

declare const customTransport: ChatTransport<
  UIMessage<unknown, { custom: { message: string } }>
>;

function CustomAIView({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLElement | null>;
}) {
  useAIChat({
    editableRef,
    transport: customTransport,
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
