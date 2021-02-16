import { BoldPluginOptions } from '../bold/types';
import { CodePluginOptions } from '../code/types';
import { ItalicPluginOptions } from '../italic/types';
import { StrikethroughPluginOptions } from '../strikethrough/types';
import { SubscriptPluginOptions } from '../subsupscript/subscript/types';
import { SuperscriptPluginOptions } from '../subsupscript/superscript/types';
import { UnderlinePluginOptions } from '../underline/types';

// Plugin options
export interface BasicMarkPluginsOptions
  extends BoldPluginOptions,
    CodePluginOptions,
    ItalicPluginOptions,
    StrikethroughPluginOptions,
    SubscriptPluginOptions,
    SuperscriptPluginOptions,
    UnderlinePluginOptions {}
