import { history } from 'plitejs/history';

import { defineBasePlugin, type DefinitionOf } from '../plugin';

export const HistoryPlugin = defineBasePlugin('history', {}).extend(history());

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
