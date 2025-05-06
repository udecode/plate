import { toPlatePlugin } from '@udecode/plate/react';

// Explicitly import the types from providers
import { BaseYjsPlugin } from '../lib/BaseYjsPlugin';

/** Enables support for real-time collaboration using Yjs. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin);
