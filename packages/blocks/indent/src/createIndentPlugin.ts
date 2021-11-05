import { getOverrideProps } from '@udecode/plate-common';
import { PlatePluginEditor } from '@udecode/plate-core';
import { KEY_INDENT } from './defaults';
import { getIndentOnKeyDown } from './getIndentOnKeyDown';
import { IndentPluginOptions } from './types';
import { withIndent } from './withIndent';

export const createIndentPlugin = (
  options?: IndentPluginOptions
): PlatePluginEditor => ({
  overrideProps: getOverrideProps(KEY_INDENT),
  withOverrides: withIndent(options),
  onKeyDown: getIndentOnKeyDown(),
});
