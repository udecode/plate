import { BlockquotePluginOptions } from '../blockquote/types';
import { CodeBlockPluginOptions } from '../code-block/types';
import { HeadingPluginOptions } from '../heading/types';
// Plugin options
import { ParagraphPluginOptions } from '../paragraph/types';

export interface BasicElementPluginsOptions
  extends BlockquotePluginOptions,
    CodeBlockPluginOptions,
    HeadingPluginOptions,
    ParagraphPluginOptions {}
