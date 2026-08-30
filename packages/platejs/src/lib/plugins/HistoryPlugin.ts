import { history } from '../../history/plite-history.internal';
import { defineBasePlugin, type DefinitionOf } from '../plugin';

export const HistoryPlugin = defineBasePlugin('history', {}).extend(history());

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
