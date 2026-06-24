import type { PluginConfig } from '../../plugin/BasePlugin';

import { createEditorPlugin } from '../../plugin/createEditorPlugin';

export type AffinityConfig = PluginConfig<'affinity'>;

export const AffinityPlugin = Object.assign(
  createEditorPlugin<AffinityConfig>({
    key: 'affinity',
  }),
  { runtimeAffinity: true }
);
