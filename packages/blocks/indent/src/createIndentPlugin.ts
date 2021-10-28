import { PlatePluginEditor } from '@udecode/plate-core';
import { getIndentOnKeyDown } from './getIndentOnKeyDown';
import { getIndentOverrideProps } from './getIndentOverrideProps';
import { IndentPluginOptions } from './types';
import { withIndent } from './withIndent';

export const createIndentPlugin = (
  options?: IndentPluginOptions
): PlatePluginEditor => ({
  overrideProps: getIndentOverrideProps(),
  withOverrides: withIndent(options),
  onKeyDown: getIndentOnKeyDown,
});
