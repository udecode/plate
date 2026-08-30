import type { DefinitionOf } from '../../core';
import { toPlatePlugin } from '../../react/core';
import { BaseAIPlugin } from '../lib';

export const AIPlugin = toPlatePlugin(BaseAIPlugin);

export type AIDefinition = DefinitionOf<typeof AIPlugin>;
