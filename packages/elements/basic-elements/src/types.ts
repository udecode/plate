import { CodeBlockPluginOptions } from '@udecode/plate-code-block';
import { HeadingPluginOptions } from '@udecode/plate-heading';

export interface BasicElementPluginsOptions {
  heading?: HeadingPluginOptions;
  syntax?: CodeBlockPluginOptions;
  syntaxPopularFirst?: CodeBlockPluginOptions;
}
