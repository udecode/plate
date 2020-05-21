import { SlatePlugin } from 'common/types';
import { deserializeList } from './deserializeList';
import { onKeyDownList } from './onKeyDownList';
import { renderElementList } from './renderElementList';
import { ListPluginOptions } from './types';

export const ListPlugin = (options?: ListPluginOptions): SlatePlugin => ({
  renderElement: renderElementList(options),
  deserialize: deserializeList(options),
  onKeyDown: onKeyDownList(options),
});
