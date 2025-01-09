import type { ExtendConfig } from '@udecode/plate';

import { toPlatePlugin } from '@udecode/plate/react';

import { type BaseAIPluginConfig, BaseAIPlugin } from '../../lib';

export type AIPluginConfig = ExtendConfig<BaseAIPluginConfig>;

export const AIPlugin = toPlatePlugin(BaseAIPlugin);
