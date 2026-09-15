import { history } from '../../history/plite-history.internal';
import { definePlugin, type DefinitionOf } from '../plugin';

export const HistoryPlugin = definePlugin('history', {}).extend(history());

export type HistoryDefinition = DefinitionOf<typeof HistoryPlugin>;
