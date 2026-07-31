import { history } from '@platejs/plite-history';
import { createBasePlugin, type DefinitionOf } from '../plugin';

export const HistoryPlugin = createBasePlugin({
  name: 'history',
}).extend(history());

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
