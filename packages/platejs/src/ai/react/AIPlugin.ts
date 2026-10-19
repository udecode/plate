import type { DefinitionOf } from '../../core';
import { toReactPlugin } from '../../react/core';
import { BaseAIPlugin } from '../lib';

export const AIPlugin = toReactPlugin(BaseAIPlugin);

export type AIDefinition = DefinitionOf<typeof AIPlugin>;
