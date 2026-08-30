import { definePlatePlugin, usePluginStore } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

const Component = () => null;

const AIChatKitPlugin = definePlatePlugin('typedAIChatKit', {
  dependencies: [AIChatPlugin],
  initialState: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
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

const useAssertTypedAIChatKitStore = () => {
  const chatOptions = usePluginStore(AIChatKitPlugin, 'chatOptions');
  const api: string = chatOptions.api;

  void api;
};

void ConfiguredAIChatPlugin;
void useAssertTypedAIChatKitStore;
