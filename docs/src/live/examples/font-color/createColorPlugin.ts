import {getRenderLeaf} from '@udecode/slate-plugins';
import {SlatePlugin} from '@udecode/slate-plugins-core';
import {MARK_COLOR} from './defaults';
import {getColorDeserialize} from './getColorDeserialize';

export const createColorPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_COLOR,
  renderLeaf: getRenderLeaf(MARK_COLOR),
  deserialize: getColorDeserialize(),
});
