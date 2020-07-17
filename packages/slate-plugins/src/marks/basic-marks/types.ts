import { BoldPluginOptions } from '../bold';
import { CodePluginOptions } from '../code';
import { ItalicPluginOptions } from '../italic';
import { StrikethroughPluginOptions } from '../strikethrough';
import { SubscriptPluginOptions } from '../subsupscript/subscript/types';
import { SuperscriptPluginOptions } from '../subsupscript/superscript/types';
import { UnderlinePluginOptions } from '../underline';

// Plugin options
export interface BasicMarkPluginsOptions
  extends BoldPluginOptions,
    CodePluginOptions,
    ItalicPluginOptions,
    StrikethroughPluginOptions,
    SubscriptPluginOptions,
    SuperscriptPluginOptions,
    UnderlinePluginOptions {}
