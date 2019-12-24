import { SlatePlugin } from 'slate-plugins/types';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';

export const LinkPlugin = (): SlatePlugin => ({
  renderElement: renderElementLink(),
  deserialize: deserializeLink(),
});
