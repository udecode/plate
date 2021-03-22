import { withReact } from 'slate-react';
import { getSlatePluginWithOverrides } from '../utils/getSlatePluginWithOverrides';

/**
 * @see {@link withReact}
 */
export const useReactPlugin = getSlatePluginWithOverrides(() => withReact);
