import { SlatePlugin } from 'common/types';
import { deserializeList } from './deserializeList';
import { onKeyDownList } from './onKeyDownList';
import { renderElementList } from './renderElementList';
import { RenderElementListOptions } from './types';

export const ListPlugin = (
  options?: RenderElementListOptions
): SlatePlugin => ({
  renderElement: renderElementList(options),
  deserialize: deserializeList(options),
  onKeyDown: onKeyDownList(options),
});
