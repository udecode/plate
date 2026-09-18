import {
  history,
  type HistoryPlugin as PliteHistoryPlugin,
} from '../../history/plite-history.internal';
import {
  definePlugin,
  type DefinitionOf,
  type InternalBasePluginRuntimeExtension,
} from '../plugin';

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

export const HistoryPlugin: InternalBasePluginRuntimeExtension<
  typeof BaseHistoryPlugin,
  DefinitionOf<typeof BaseHistoryPlugin>,
  PliteHistoryPlugin
> = BaseHistoryPlugin.extend(({ store }) =>
  history({
    get maxDepth() {
      return store.get('maxDepth');
    },
    get newBatchDelay() {
      return store.get('newBatchDelay');
    },
  })
);

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
