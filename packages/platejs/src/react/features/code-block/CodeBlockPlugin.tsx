import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { toReactPlugin } from '../../core';

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toReactPlugin(BaseCodeBlockPlugin);

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toReactPlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
});
