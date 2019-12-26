import { SlatePlugin } from 'types';
import { deserializeList } from './deserializeList';
import { renderElementList } from './renderElementList';
import { RenderElementListOptions } from './types';

export const ListPlugin = (
  options?: RenderElementListOptions
): SlatePlugin => ({
  renderElement: renderElementList(options),
  deserialize: deserializeList(),
});
