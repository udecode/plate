import type { RuntimePluginTypeProviderOf } from '../../facade';
import {
  history,
  type HistoryApi,
  type HistoryPlugin as PliteHistoryPlugin,
  type HistoryStateApi,
  type HistoryTxApi,
} from '../../history/plite-history.internal';
import { definePlugin, type BasePlugin, type DefinitionOf } from '../plugin';

export type HistoryPluginState = {
  maxDepth: number;
  newBatchDelay: number;
};

const BaseHistoryPlugin = definePlugin('history', {
  initialState: {
    maxDepth: 100,
    newBatchDelay: 500,
  } satisfies HistoryPluginState,
});

type HistoryPluginDefinition = Readonly<{
  activate: true;
  api: HistoryApi;
  enabled: boolean;
  initialState: HistoryPluginState;
  name: 'history';
  on: true;
  read: HistoryStateApi;
  update: HistoryTxApi;
  validate: true;
}>;

type HistoryPluginDescriptor = BasePlugin<HistoryPluginDefinition> &
  RuntimePluginTypeProviderOf<PliteHistoryPlugin>;

const HistoryPluginImplementation = BaseHistoryPlugin.extend(({ store }) =>
  history({
    get maxDepth() {
      return store.get('maxDepth');
    },
    get newBatchDelay() {
      return store.get('newBatchDelay');
    },
  })
);

// Keep the exported descriptor finite; expanding the equivalent generic merge
// exhausts TypeScript when the complete package-integration graph is loaded.
export const HistoryPlugin =
  HistoryPluginImplementation as unknown as HistoryPluginDescriptor;

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
