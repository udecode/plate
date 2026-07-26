import { bindFirst } from '@udecode/utils';

import { type PluginConfig, createBasePlugin } from '../../plugin';
import { deserializeHtml } from './utils';

export type HtmlApi = {
  deserialize: (
    options: Parameters<typeof deserializeHtml>[1]
  ) => ReturnType<typeof deserializeHtml>;
};

/**
 * Enables support for deserializing inserted HTML into Plite content.
 */
export const HtmlPlugin = createBasePlugin<
  PluginConfig<'html', {}, {}, {}, {}, {}, readonly [], never, HtmlApi>
>({
  api: ({ editor }) => ({
    deserialize: bindFirst(deserializeHtml, editor),
  }),
  key: 'html',
});
