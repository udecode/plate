import type { DefinitionOf } from '@platejs/core';

import { toPlatePlugin } from '@platejs/core/react';

import { BaseAIPlugin } from '../lib';

export const AIPlugin = toPlatePlugin(BaseAIPlugin);

export type AIDefinition = DefinitionOf<typeof AIPlugin>;
