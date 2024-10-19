import type { ExtendConfig } from '@udecode/plate-common';

import { toPlatePlugin } from '@udecode/plate-common/react';

import { type BaseAIPluginConfig, BaseAIPlugin } from '../../lib';

export type AIPluginConfig = ExtendConfig<BaseAIPluginConfig>;

export const AIPlugin = toPlatePlugin(BaseAIPlugin);
