import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';

export const LinkPlugin = (
  options?: RenderElementOptions & { typeLink?: string }
): SlatePlugin => ({
  renderElement: renderElementLink(options),
  deserialize: deserializeLink(options),
});
