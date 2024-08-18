import { extendPlugin } from '@udecode/plate-common/react';

import { YjsPlugin as BaseYjsPlugin } from '../lib/YjsPlugin';
import { RenderAboveEditableYjs } from './RenderAboveEditableYjs';

/** Enables support for real-time collaboration using Yjs. */
export const YjsPlugin = extendPlugin(BaseYjsPlugin, {
  renderAboveEditable: RenderAboveEditableYjs,
});
