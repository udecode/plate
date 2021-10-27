import { PlatePluginEditor } from '@udecode/plate-core';
import { getIndentOverrideProps } from './getIndentOverrideProps';
import { onKeyDownHandler } from './onKeyDownHandler';
import { IndentPluginOptions } from './types';
import { withIndent } from './withIndent';

export const createIndentPlugin = (
  options?: IndentPluginOptions
): PlatePluginEditor => ({
  overrideProps: getIndentOverrideProps(),
  withOverrides: withIndent(options),
  onKeyDown: onKeyDownHandler,
});
