import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
} from '../../../features/code-block/lib/BaseCodeBlockPlugin';
import { toPlatePlugin } from '../../core';

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin);

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
});
