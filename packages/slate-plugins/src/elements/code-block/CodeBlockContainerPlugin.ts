/**
 * Enables support for pre-formatted code blocks wrapped in a void element.
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { renderElementCodeBlockContainer } from './renderElementCodeBlockContainer';
import {
  CodeBlockContainerPluginOptions,
  CodeBlockPluginOptions,
} from './types';

export const CodeBlockContainerPlugin = (
  options?: CodeBlockPluginOptions & CodeBlockContainerPluginOptions
): SlatePlugin => {
  const { code_block_container } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  return {
    renderElement: renderElementCodeBlockContainer(options),
    voidTypes: [code_block_container.type],
  };
};
