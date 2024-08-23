import { bindFirst } from '@udecode/plate-common';
import { createPlatePlugin } from '@udecode/plate-common/react';

import { serializeHtml } from './serializeHtml';

export const HtmlReactPlugin = createPlatePlugin({
  key: 'htmlReact',
}).extendApi(({ editor }) => ({
  serialize: bindFirst(serializeHtml, editor),
}));
