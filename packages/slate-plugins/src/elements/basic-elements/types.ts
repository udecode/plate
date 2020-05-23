import { BlockquotePluginOptions } from 'elements/blockquote';
import { CodeBlockPluginOptions } from 'elements/code-block';
import { HeadingPluginOptions } from 'elements/heading';
import { ParagraphPluginOptions } from 'elements/paragraph';

// Plugin options
export interface BasicElementPluginsOptions
  extends BlockquotePluginOptions,
    CodeBlockPluginOptions,
    HeadingPluginOptions,
    ParagraphPluginOptions {}
