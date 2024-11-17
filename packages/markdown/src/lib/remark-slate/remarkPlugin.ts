/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Processor } from 'unified';

import type { MdastNode, RemarkPluginOptions } from './types';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkDefaultCompiler } from './remarkDefaultCompiler';
import { remarkSplitLineBreaksCompiler } from './remarkSplitLineBreaksCompiler';

export function remarkPlugin(
  this: Processor<undefined, undefined, undefined, MdastNode, any>,
  options: RemarkPluginOptions
) {
  const shouldSplitLineBreaks =
    options.editor.getOptions(MarkdownPlugin).splitLineBreaks;

  this.compiler = shouldSplitLineBreaks
    ? (tree: MdastNode) => remarkSplitLineBreaksCompiler(tree, options)
    : (tree: MdastNode) => remarkDefaultCompiler(tree, options);
}
