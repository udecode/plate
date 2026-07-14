import type { ExtendConfig } from '@platejs/core';

import { toPlatePlugin } from '@platejs/core/react';

import { type BaseAIPluginConfig, BaseAIPlugin } from '../../lib';

export type AIPluginConfig = ExtendConfig<BaseAIPluginConfig>;

export const AIPlugin = toPlatePlugin(BaseAIPlugin);
