import { PlatePluginEditor } from '@udecode/plate-core';
import { getIndentOverrideProps } from './getIndentOverrideProps';
import { IndentPluginOptions } from './types';
import { withIndent } from './withIndent';

export const createIndentPlugin = (
  options?: IndentPluginOptions
): PlatePluginEditor => ({
  overrideProps: getIndentOverrideProps(),
  withOverrides: withIndent(options),
});
