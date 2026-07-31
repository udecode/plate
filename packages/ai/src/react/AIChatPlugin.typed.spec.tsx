import { createPlatePlugin, usePluginStore } from '@platejs/core/react';

import { AIChatPlugin } from './AIChatPlugin';

const Component = () => null;

const AIChatKitPlugin = createPlatePlugin({
  dependencies: [AIChatPlugin],
  initialState: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
  name: 'typedAIChatKit',
  useHooks: ({ editor }) => {
    const { api, read, store, update } = editor.plugin(AIChatPlugin);

    void api;
    void read;
    void store;
    void update;
  },
});

const ConfiguredAIChatPlugin = AIChatPlugin.configure({
  component: Component,
  render: {
    afterContainer: Component,
    afterEditable: Component,
  },
  shortcuts: {
    show: { keys: 'mod+j' },
  },
});

const assertTypedAIChatKitStore = () => {
  const chatOptions = usePluginStore(AIChatKitPlugin, 'chatOptions');
  const api: string = chatOptions.api;

  void api;
};

void ConfiguredAIChatPlugin;
void assertTypedAIChatKitStore;
