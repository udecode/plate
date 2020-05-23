import { BoldPluginOptions } from 'marks/bold';
import { CodePluginOptions } from 'marks/code/types';
import { ItalicPluginOptions } from 'marks/italic/types';
import { StrikethroughPluginOptions } from 'marks/strikethrough/types';
import { SubscriptPluginOptions } from 'marks/subscript/types';
import { SuperscriptPluginOptions } from 'marks/superscript/types';
import { UnderlinePluginOptions } from 'marks/underline';

// Plugin options
export interface BasicMarkPluginsOptions
  extends BoldPluginOptions,
    CodePluginOptions,
    ItalicPluginOptions,
    StrikethroughPluginOptions,
    SubscriptPluginOptions,
    SuperscriptPluginOptions,
    UnderlinePluginOptions {}
