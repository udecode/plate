import { BlockquotePluginOptions } from '../blockquote';
import { CodeBlockPluginOptions } from '../code-block';
import { HeadingPluginOptions } from '../heading';
import { ParagraphPluginOptions } from '../paragraph';

// Plugin options
export interface BasicElementPluginsOptions
  extends BlockquotePluginOptions,
    CodeBlockPluginOptions,
    HeadingPluginOptions,
    ParagraphPluginOptions {}
