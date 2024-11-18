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

  const compiler = (node: MdastNode) => {
    if (shouldSplitLineBreaks) {
      return remarkSplitLineBreaksCompiler(node, options);
    }

    return remarkDefaultCompiler(node, options);
  };

  this.compiler = compiler;
}
