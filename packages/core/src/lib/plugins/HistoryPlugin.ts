import { history } from '@platejs/plite-history';
import { defineBasePlugin, type DefinitionOf } from '../plugin';

export const HistoryPlugin = defineBasePlugin('history', {}).extend(history());

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
