import { SlatePlugin } from 'slate-react';
import { deserializeLink } from './deserializeLink';
import { renderElementLink } from './renderElementLink';

export const LinkPlugin = (): SlatePlugin => ({
  renderElement: renderElementLink(),
  deserialize: deserializeLink(),
});
