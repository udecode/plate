import { withReact } from 'slate-react';
import { getSlatePluginWithOverrides } from '../utils/getSlatePluginWithOverrides';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = getSlatePluginWithOverrides(() => withReact);
